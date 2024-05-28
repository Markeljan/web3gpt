import type { AssistantStatus, Message } from "ai"

import { ChatMessage } from "@/components/chat/chat-message"
import { Separator } from "@/components/ui/separator"
import { nanoid } from "@/lib/utils"

export type ChatList = {
  messages: Message[]
  avatarUrl?: string | null
  status?: AssistantStatus
}

export function ChatList({ messages, avatarUrl, status }: ChatList) {
  if (!messages || messages.length === 0) {
    return null
  }

  return (
    <div className="relative flex flex-col mx-auto max-md:max-w-2xl max-w-4xl w-full p-2 md:translate-x-[10%]">
      {messages.map((message, index) => (
        <div className="flex flex-col w-full" key={`${message.id}-${nanoid()}`}>
          <ChatMessage message={message} avatarUrl={avatarUrl} status={status} />
          {index < messages.length - 1 && <Separator className="my-4 md:my-8 md:-translate-x-[5%]" />}
        </div>
      ))}
    </div>
  )
}
