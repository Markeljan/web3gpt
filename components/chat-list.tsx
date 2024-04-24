import type { Message } from "ai"
import { Separator } from "@/components/ui/separator"
import { ChatMessage } from "@/components/chat-message"
import { cn, filterMessages, nanoid } from "@/lib/utils"

export interface ChatList {
  messages: Message[]
  avatarUrl?: string | null | undefined
  isLoading?: boolean
}

export function ChatList({ messages, avatarUrl, isLoading }: ChatList) {
  // Remove system messages and function returns from the list
  const filteredMessages = filterMessages(messages)
  return (
    <div className={cn("relative mx-auto max-w-2xl px-2", isLoading && "pointer-events-none")}>
      {filteredMessages.map((message, index) => (
        <div key={`${message.id}-${nanoid()}`}>
          <ChatMessage message={message} avatarUrl={avatarUrl} />
          {index < filteredMessages.length - 1 && <Separator className="my-4 md:my-8" />}
        </div>
      ))}
    </div>
  )
}
