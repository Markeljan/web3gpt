import { notFound } from "next/navigation"

import { formatDate } from "@/lib/utils"
import { getAgent, getPublishedChat } from "@/lib/actions/db"
import { getAiThreadMessages } from "@/lib/actions/ai"
import { ChatList } from "@/components/chat/chat-list"
import type { ChatPageProps } from "@/lib/types"
import { AgentCard } from "@/components/agent-card"
import { Landing } from "@/components/landing"
import { auth } from "@/auth"
import type { Metadata } from "next"
import { APP_URL } from "@/lib/config"

export async function generateMetadata({ params }: ChatPageProps) {
  const metadata: Metadata = {
    title: "Shared Chat",
    description: "Write and deploy smart contracts with AI",
    openGraph: {
      images: [`${APP_URL}/api/og?id=${params.id}&h=630`],
      url: `${APP_URL}/share/${params.id}`
    },
    twitter: {
      card: "summary_large_image",
      site: "@w3gpt_ai",
      images: [`${APP_URL}/api/og?id=${params.id}&h=675`]
    }
  }
  return metadata
}

export default async function SharePage({ params, searchParams }: ChatPageProps) {
  const [session, chat] = await Promise.all([auth(), getPublishedChat(params.id)])
  const userId = session?.user?.id

  if (!chat || !chat.published) {
    notFound()
  }
  const agentId = chat.agentId || (searchParams?.a as string)
  const [agent, messages] = await Promise.all([agentId ? getAgent(agentId) : undefined, getAiThreadMessages(chat.id)])

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
