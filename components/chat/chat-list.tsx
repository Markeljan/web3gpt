import type { AssistantStatus, Message } from "ai"

import { ChatMessage } from "@/components/chat/chat-message"
import { Separator } from "@/components/ui/separator"

export type ChatList = {
  messages: Message[]
  avatarUrl?: string | null
  status?: AssistantStatus
}

export const ChatList = ({ messages, avatarUrl, status }: ChatList) => {
  if (!messages || messages.length === 0) {
    return null
  }
  return (
    <div className="relative mx-auto flex w-full max-w-4xl flex-col p-2 max-md:max-w-2xl md:translate-x-[8%]">
      {messages
        .filter((unfilteredMessage) => unfilteredMessage.role !== "system")
        .map((message, index) => (
          <div className="flex w-full flex-col" key={`${message.id}`}>
            <ChatMessage avatarUrl={avatarUrl} message={message} status={status} />
            {index < messages.length - 1 && <Separator className="md:-translate-x-[5%] my-4 md:my-8" />}
          </div>
        ))}
    </div>
  )
}
