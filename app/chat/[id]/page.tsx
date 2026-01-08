import { notFound, redirect } from "next/navigation"

import { auth } from "@/auth"
import { Chat } from "@/components/chat/chat"
import { DEFAULT_AGENT } from "@/lib/constants"
import { getAgent, getChat } from "@/lib/data/kv"
import type { NextPageProps } from "@/lib/types"

export default async function ChatPage({ params, searchParams }: NextPageProps) {
  const session = await auth()
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

  const agent = await getAgent(agentId)

  // Use messages stored in KV
  const messages = chat.messages || []

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
