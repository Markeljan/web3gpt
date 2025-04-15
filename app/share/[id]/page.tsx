import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { auth } from "@/auth"
import { AgentCard } from "@/components/agent-card"
import { ChatList } from "@/components/chat/chat-list"
import { Landing } from "@/components/landing"
import { DEPLOYMENT_URL } from "@/lib/config"
import { getAgent, getPublishedChat } from "@/lib/data/kv"
import { getAiThreadMessages } from "@/lib/data/openai"
import type { NextPageProps } from "@/lib/types"
import { formatDate } from "@/lib/utils"

export async function generateMetadata({ params }: NextPageProps) {
  const metadata: Metadata = {
    title: "Shared Chat",
    description: "Deploy smart contracts, create AI Agents, do more onchain with AI.",
    openGraph: {
      images: [`${DEPLOYMENT_URL}/api/og?id=${params.id}&h=630`],
      url: `${DEPLOYMENT_URL}/share/${params.id}`,
    },
    twitter: {
      card: "summary_large_image",
      site: "@w3gptai",
      images: [`${DEPLOYMENT_URL}/api/og?id=${params.id}&h=675`],
    },
  }
  return metadata
}

export default async function SharePage({ params, searchParams }: NextPageProps) {
  const [session, chat] = await Promise.all([auth(), getPublishedChat(params.id)])
  const userId = session?.user.id

  if (!chat || !chat.published) {
    notFound()
  }
  const { title, avatarUrl, agentId = searchParams?.a, createdAt = new Date(), id: chatId = params.id } = chat

  const [agent, messages] = await Promise.all([
    typeof agentId === "string" ? getAgent(agentId) : undefined,
    getAiThreadMessages(chatId),
  ])

  return (
    <>
      <div className="flex-1 space-y-6">
        <div className="border-b bg-background px-4 py-6 md:px-6 md:py-8">
          <div className="mx-auto max-w-2xl md:px-6">
            <div className="space-y-1 md:-mx-8">
              <h1 className="text-2xl font-bold">{title}</h1>
              <div className="text-sm text-muted-foreground">
                {formatDate(createdAt)} · {messages.length} messages
              </div>
            </div>
          </div>
        </div>
        {agent ? <AgentCard agent={agent} /> : <Landing userId={userId} />}
        <ChatList messages={messages} avatarUrl={avatarUrl} />
      </div>
    </>
  )
}
