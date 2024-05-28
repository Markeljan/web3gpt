import { notFound, redirect } from "next/navigation"

import { auth } from "@/auth"
import { getAgent, getChat } from "@/lib/actions/db"
import { getAiThreadMessages } from "@/lib/actions/ai"
import { Chat } from "@/components/chat/chat"
import type { ChatPageProps } from "@/lib/types"

export default async function ChatPage({ params, searchParams }: ChatPageProps) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect(`/sign-in?next=/chat/${params.id}`)
  }

  const chat = await getChat(params.id)

  if (!chat) {
    redirect("/")
  }

  if (chat?.userId !== session?.user?.id) {
    notFound()
  }

  const agentId = chat.agentId || (searchParams?.a as string)
  const [agent, messages] = await Promise.all([agentId ? getAgent(agentId) : undefined, getAiThreadMessages(params.id)])

  return <Chat agent={agent} threadId={chat.id} initialMessages={messages} session={session} />
}
