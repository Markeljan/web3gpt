import { notFound } from "next/navigation"

import { formatDate } from "@/lib/utils"
import { getAgent, getPublishedChat } from "@/lib/actions/db"
import { getAiThreadMessages } from "@/lib/actions/ai"
import { ChatList } from "@/components/chat/chat-list"
import type { ChatPageProps } from "@/lib/types"
import { AgentCard } from "@/components/agent-card"
import { Landing } from "@/components/landing"
import { auth } from "@/auth"

export default async function SharePage({ params, searchParams }: ChatPageProps) {
  const session = await auth()
  const userId = session?.user?.id
  const chat = await getPublishedChat(params.id)

  if (!chat || !chat.published) {
    notFound()
  }
  const agentId = chat.agentId || (searchParams?.a as string)
  const agent = agentId ? await getAgent(agentId) : undefined

  const threadId = chat.id

  const messages = await getAiThreadMessages(threadId)

  return (
    <>
      <div className="flex-1 space-y-6">
        <div className="border-b bg-background px-4 py-6 md:px-6 md:py-8">
          <div className="mx-auto max-w-2xl md:px-6">
            <div className="space-y-1 md:-mx-8">
              <h1 className="text-2xl font-bold">{chat.title}</h1>
              <div className="text-sm text-muted-foreground">
                {formatDate(chat.createdAt)} · {messages.length} messages
              </div>
            </div>
          </div>
        </div>
        {agent ? <AgentCard agent={agent} /> : <Landing userId={userId} />}
        <ChatList messages={messages} avatarUrl={chat.avatarUrl} />
      </div>
    </>
  )
}
