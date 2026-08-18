import type { UIMessage } from "ai"
import { notFound, redirect } from "next/navigation"
import { Chat } from "@/components/chat/chat"
import { getSession } from "@/lib/auth"
import { DEFAULT_AGENT } from "@/lib/constants"
import { getAgentById } from "@/lib/data/agents"
import { getChat } from "@/lib/data/kv"
import type { NextPageProps } from "@/lib/types"

export default async function ChatPage({ params, searchParams }: NextPageProps) {
  const session = await getSession()
  const { id } = await params
  const searchParamsResolved = await searchParams

  if (!session?.user.id) {
    redirect(`/sign-in?next=/chat/${id}`)
  }

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
