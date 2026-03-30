import type { UIMessage } from "ai"
import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { streamAgentReply } from "@/lib/agent-chat"
import { buildChatTitle, createTextMessage, getResponseText } from "@/lib/chat-utils"
import { storeChat } from "@/lib/data/kv"
import type { DbChat } from "@/lib/types"

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

  const { result } = await streamAgentReply({
    agentId,
    messages,
    onFinish: async ({ response }) => {
      // Store chat after completion if user is logged in
      if (userId && chatId) {
        const assistantText = getResponseText({
          responseMessages: response.messages,
        })
        const responseMessages: UIMessage[] = assistantText ? [createTextMessage("assistant", assistantText)] : []
        const allMessages = [...messages, ...responseMessages]

        const chat: DbChat = {
          id: chatId,
          userId,
          title: buildChatTitle(allMessages),
          agentId,
          createdAt: Date.now(),
          avatarUrl,
          published: false,
          messages: allMessages,
        }

        await storeChat({ data: chat, userId })
      }
    },
    userId,
  })

  return result.toUIMessageStreamResponse({
    sendReasoning: true,
  })
}
