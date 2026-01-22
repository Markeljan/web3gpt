import type { UIMessage } from "ai"
import { ChatMessage } from "@/components/chat/chat-message"
import { Separator } from "@/components/ui/separator"
import type { LegacyMessage } from "@/lib/types"

export type ChatListProps = {
  messages: (UIMessage | LegacyMessage)[]
  avatarUrl?: string | null
  isLoading?: boolean
  isStreaming?: boolean
}

export const ChatList = ({ messages, avatarUrl, isLoading, isStreaming = false }: ChatListProps) => {
  if (!messages || messages.length === 0) {
    return null
  }

  // const filteredMessages = messages.filter((msg) => msg.role !== "system")

  return (
    <div className="relative mx-auto flex w-full max-w-4xl flex-col p-2 max-md:max-w-2xl md:translate-x-[8%]">
      {messages.map((message, index) => {
        const isLastMessage = index === messages.length - 1
        return (
          <div className="flex w-full flex-col" key={`${message.id}`}>
            <ChatMessage
              avatarUrl={avatarUrl}
              isLastMessage={isLastMessage}
              isLoading={isLoading}
              isStreaming={isStreaming}
              message={message}
            />
            {index < messages.length - 1 && <Separator className="my-4 md:my-8 md:-translate-x-[5%]" />}
          </div>
        )
      })}
    </div>
  )
}
