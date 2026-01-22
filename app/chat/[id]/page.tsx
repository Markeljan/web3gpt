import type { UIMessage } from "ai"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/auth"
import { Chat } from "@/components/chat/chat"
import { DEFAULT_AGENT } from "@/lib/constants"
import { getChat } from "@/lib/data/kv"
import { getAgentById, getAiThreadAssistantId, getAiThreadMessages } from "@/lib/data/openai"
import type { NextPageProps } from "@/lib/types"

// Check if this is an old OpenAI thread ID (starts with "thread_")
const isOldThreadId = (id: string): boolean => id.startsWith("thread_")

export default async function ChatPage({ params, searchParams }: NextPageProps) {
  const session = await auth()
  const { id } = await params
  const searchParamsResolved = await searchParams

  if (!session?.user.id) {
    redirect(`/sign-in?next=/chat/${id}`)
  }

  // Check if this is an old OpenAI thread
  const isOldThread = isOldThreadId(id)

  if (isOldThread) {
    // Handle old OpenAI threads
    try {
      const [threadMessages, threadAssistantId] = await Promise.all([
        getAiThreadMessages(id),
        getAiThreadAssistantId(id),
      ])

      if (!threadAssistantId) {
        notFound()
      }

      const threadAgent = await getAgentById(threadAssistantId)

      return (
        <Chat
          agent={threadAgent || DEFAULT_AGENT}
          avatarUrl={session.user.image}
          initialChatId={id}
          initialMessages={threadMessages}
          isDeprecated={true}
          userId={session.user.id}
        />
      )
    } catch {
      notFound()
    }
  }

  // Handle new KV-stored chats
  const chat = await getChat(id)

  if (!chat) {
    redirect("/")
  }

  if (String(chat?.userId) !== session?.user.id) {
    notFound()
  }

  const agentId = chat.agentId || searchParamsResolved?.a
  if (typeof agentId !== "string") {
    notFound()
  }

  const agent = await getAgentById(agentId)

  // Use messages stored in KV - convert LegacyMessage to UIMessage if needed
  const messages = (chat.messages || []).map((msg) => {
    // If it's already a UIMessage (has parts array), return as is
    if ("parts" in msg && Array.isArray(msg.parts)) {
      return msg as UIMessage
    }
    // If it's a LegacyMessage (has content), convert to UIMessage
    if ("content" in msg && typeof msg.content === "string") {
      return {
        id: msg.id,
        role: msg.role,
        parts: [{ type: "text", text: msg.content }],
      } as UIMessage
    }
    // Fallback: create empty message
    return {
      id: msg.id,
      role: msg.role,
      parts: [{ type: "text", text: "" }],
    } as UIMessage
  })

  return (
    <Chat
      agent={agent || DEFAULT_AGENT}
      avatarUrl={session.user.image}
      initialChatId={chat.id}
      initialMessages={messages}
      userId={session.user.id}
    />
  )
}
