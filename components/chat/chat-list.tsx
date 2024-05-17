import type { Message } from "ai"

import { ChatMessage } from "@/components/chat/chat-message"
import { Separator } from "@/components/ui/separator"
import { cn, nanoid } from "@/lib/utils"

export type ChatList = {
  messages: Message[]
  isLoading?: boolean
  avatarUrl?: string | null
}

export function ChatList({ messages, avatarUrl }: ChatList) {
  return (
    <div className={cn("relative mx-auto max-md:max-w-2xl max-w-3xl px-2")}>
      {messages.map((message, index) => (
        <div key={`${message.id}-${nanoid()}`}>
          <ChatMessage message={message} avatarUrl={avatarUrl} />
          {index < messages.length - 1 && <Separator className="my-4 md:my-8" />}
        </div>
      ))}
    </div>
  )
}
