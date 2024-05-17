import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { formatDate } from "@/lib/utils"
import { getPublishedChat } from "@/app/actions"
import { ChatList } from "@/components/chat/chat-list"
import type { ChatPageProps } from "@/app/page"

export async function generateMetadata({ params }: ChatPageProps): Promise<Metadata> {
  const chat = await getPublishedChat(params.id)

  return {
    title: chat?.title.slice(0, 50) || "Chat"
  }
}

export default async function SharePage({ params }: ChatPageProps) {
  const chat = await getPublishedChat(params.id)

  if (!chat?.published) {
    notFound()
  }

  return (
    <>
      <div className="flex-1 space-y-6">
        <div className="border-b bg-background px-4 py-6 md:px-6 md:py-8">
          <div className="mx-auto max-w-2xl md:px-6">
            <div className="space-y-1 md:-mx-8">
              <h1 className="text-2xl font-bold">{chat.title}</h1>
              <div className="text-sm text-muted-foreground">
                {formatDate(chat.createdAt)} · {chat.messages.length} messages
              </div>
            </div>
          </div>
        </div>
        <ChatList messages={chat.messages} />
      </div>
    </>
  )
}
