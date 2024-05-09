import type { Message } from "ai"

import { ChatMessage } from "@/components/chat/chat-message"
import { Separator } from "@/components/ui/separator"
import { cn, nanoid } from "@/lib/utils"

export interface ChatList {
  messages: Message[]
  isLoading?: boolean
}

export function ChatList({ messages }: ChatList) {
  return (
    <div className={cn("relative mx-auto max-w-2xl px-2")}>
      {messages.map((message, index) => (
        <div key={`${message.id}-${nanoid()}`}>
          <ChatMessage message={message} />
          {index < messages.length - 1 && <Separator className="my-4 md:my-8" />}
        </div>
      ))}
    </div>
  )
}
