import { notFound, redirect } from "next/navigation"

import { auth } from "@/auth"
import { Chat } from "@/components/chat/chat"
import { DEFAULT_AGENT } from "@/lib/constants"
import { getAgent, getChat } from "@/lib/data/kv"
import { getAiThreadMessages } from "@/lib/data/openai"
import type { NextPageProps } from "@/lib/types"

export default async function ChatPage({ params, searchParams }: NextPageProps) {
  const session = await auth()

  if (!session?.user.id) {
    redirect(`/sign-in?next=/chat/${params.id}`)
  }

  const chat = await getChat(params.id)

  if (!chat) {
    redirect("/")
  }

  if (String(chat?.userId) !== session?.user.id) {
    notFound()
  }

  const agentId = chat.agentId || searchParams?.a
  if (typeof agentId !== "string") {
    notFound()
  }

  const [agent, messages] = await Promise.all([getAgent(agentId), getAiThreadMessages(params.id)])

  return (
    <Chat
      agent={agent || DEFAULT_AGENT}
      initialThreadId={chat.id}
      initialMessages={messages}
      userId={session.user.id}
      avatarUrl={session.user.image}
    />
  )
}
