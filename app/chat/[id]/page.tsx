import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"

import { auth } from "@/auth"
import { getAgent, getChat } from "@/app/actions"
import Chat from "@/components/chat"
import { openai } from "@/app/config"
import type { ChatPageProps } from "@/app/page"

export async function generateMetadata({ params }: ChatPageProps): Promise<Metadata> {
  const chat = await getChat(params.id)
  return {
    title: chat?.title.toString().slice(0, 50) || "W3GPT Chat"
  }
}

export default async function ChatPage({ params, searchParams }: ChatPageProps) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect(`/sign-in?next=/chat/${params.id}`)
  }

  const chat = await getChat(params.id)

  if (!chat) {
    notFound()
  }

  const agentId = chat.agentId || (searchParams?.a as string | undefined)
  const agent = (agentId && (await getAgent(agentId))) || undefined

  const threadId = chat.id

  const fullMessages = (await openai.beta.threads.messages.list(threadId, { order: "asc" }))?.data

  const messages = fullMessages?.map((message) => {
    const { id, content, role, created_at: createdAt } = message
    const textContent = content.find((c) => c.type === "text")
    const text = textContent?.type === "text" ? textContent.text.value : ""

    return {
      id,
      content: text,
      role,
      createdAt: new Date(createdAt)
    }
  })

  return <Chat agent={agent} threadId={threadId} initialMessages={messages} />
}
