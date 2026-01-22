import { type OpenAIResponsesProviderOptions, openai } from "@ai-sdk/openai"
import { convertToModelMessages, generateId, stepCountIs, streamText, type UIMessage } from "ai"
import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { DEFAULT_AGENT, DEFAULT_COMPILER_VERSION, DEFAULT_TOOL_NAMES, SUPPORTED_CHAINS } from "@/lib/constants"
import { storeChat } from "@/lib/data/kv"
import { getAgentById } from "@/lib/data/openai"
import { getTools } from "@/lib/tools"
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

  // Fetch agent from KV or built-in agents
  const agent = await getAgentById(agentId)

  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 })
  }

  // Build system prompt with agent instructions and current settings
  const systemPrompt = `${agent.instructions || DEFAULT_AGENT.instructions}

Current Settings:
- Compiler Version: ${DEFAULT_COMPILER_VERSION}
- Available Chains: ${SUPPORTED_CHAINS.map((chain) => `${chain.name} (chainId: ${chain.id})`).join(", ")}`

  // Create tools dynamically based on agent's toolNames (fallback to default for user-created agents without toolNames)
  const tools = getTools(agent.toolNames ?? DEFAULT_TOOL_NAMES, { userId })

  const result = streamText({
    model: openai("gpt-5-mini"),
    providerOptions: {
      openai: {
        reasoningSummary: "concise",
        reasoningEffort: "medium",
      } satisfies OpenAIResponsesProviderOptions,
    },
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    tools,
    stopWhen: stepCountIs(5),
    onFinish: async ({ response }) => {
      // Store chat after completion if user is logged in
      if (userId && chatId) {
        // Convert response messages to the format expected by DbChat
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
