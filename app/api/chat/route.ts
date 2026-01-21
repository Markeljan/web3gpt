import { openai } from "@ai-sdk/openai"
import { convertToModelMessages, generateId, stepCountIs, streamText, type UIMessage } from "ai"
import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { DEFAULT_COMPILER_VERSION, SUPPORTED_CHAINS } from "@/lib/constants"
import { storeChat } from "@/lib/data/kv"
import { getAssistantInstructions } from "@/lib/data/openai"
import { createTools } from "@/lib/tools"
import type { DbChat } from "@/lib/types"

const MAX_TITLE_LENGTH = 50

export const maxDuration = 60

export async function POST(request: NextRequest) {
  const session = await auth()
  const { id: userId, image: avatarUrl } = session?.user || {}

  const { messages, chatId, agentId } = (await request.json()) as {
    messages: UIMessage[]
    chatId?: string
    agentId: string
  }

  if (!agentId) {
    return NextResponse.json({ error: "Agent ID is required" }, { status: 400 })
  }

  // Fetch agent instructions from OpenAI
  const agentInstructions = await getAssistantInstructions(agentId)

  // Build system prompt with latest settings
  const systemPrompt = `${agentInstructions || "You are a helpful assistant for Web3 development."}

Current Settings:
- Compiler Version: ${DEFAULT_COMPILER_VERSION}
- Available Chains: ${SUPPORTED_CHAINS.map((chain) => `${chain.name} (chainId: ${chain.id})`).join(", ")}`

  // Create tools with runtime context
  const tools = createTools({ userId })

  const result = streamText({
    model: openai("gpt-5-mini"),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    tools,
    stopWhen: stepCountIs(5),
    onFinish: async ({ response }) => {
      // Store chat after completion if user is logged in
      if (userId && chatId) {
        // Convert response messages to the format expected by DbChat
        // Response messages are ModelMessages, convert them to UIMessages
        // Only include assistant messages from the response
        const responseMessages: UIMessage[] = response.messages
          .filter((msg) => msg.role === "assistant")
          .map((msg) => {
            // Extract text from model message content
            let text = ""
            if (typeof msg.content === "string") {
              text = msg.content
            } else if (Array.isArray(msg.content)) {
              const textParts = msg.content.filter((part: { type: string }) => part.type === "text")
              text = textParts
                .map((part: { type: string; text?: string }) => ("text" in part ? part.text : ""))
                .join("")
            }

            return {
              id: generateId(),
              role: "assistant",
              parts: [{ type: "text", text }],
            }
          })
        const allMessages = [...messages, ...responseMessages]
        const firstUserMessage = messages.find((m) => m.role === "user")

        // Extract title from first user message
        let title = "New Chat"
        if (firstUserMessage) {
          const textParts = firstUserMessage.parts?.filter((part) => part.type === "text") || []
          const text = textParts.map((part) => ("text" in part ? part.text : "")).join("")
          if (text) {
            title = text.slice(0, MAX_TITLE_LENGTH)
          }
        }

        const chat: DbChat = {
          id: chatId,
          userId,
          title,
          agentId,
          createdAt: Date.now(),
          avatarUrl,
          published: false,
          messages: allMessages,
        }

        await storeChat({ data: chat, userId })
      }
    },
  })

  return result.toUIMessageStreamResponse({
    sendReasoning: true,
  })
}
