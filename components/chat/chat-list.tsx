import type { ChatStatus, UIMessage } from "ai"
import { ChatMessage } from "@/components/chat/chat-message"
import { ThinkingIndicator } from "@/components/chat/thinking-indicator"
import type { LegacyMessage } from "@/lib/types"

export type ChatListProps = {
  messages: (UIMessage | LegacyMessage)[]
  avatarUrl?: string | null
  agentImageUrl?: string | null
  agentName?: string
  isStreaming?: boolean
  status?: ChatStatus
}

function hasRenderableContent(message: UIMessage | LegacyMessage): boolean {
  if ("parts" in message && Array.isArray(message.parts)) {
    return message.parts.some((part) => part.type !== "step-start")
  }
  return "content" in message && Boolean(message.content)
}

export const ChatList = ({
  messages,
  avatarUrl,
  agentImageUrl,
  agentName,
  isStreaming = false,
  status,
}: ChatListProps) => {
  const lastMessage = messages.at(-1)
  // The request is in flight but nothing has come back yet — either no assistant
  // turn exists, or it exists and is still empty (a tool call about to start).
  const isAwaitingResponse =
    status === "submitted" ||
    (status === "streaming" && lastMessage?.role === "assistant" && !hasRenderableContent(lastMessage))

  if (messages.length === 0 && !isAwaitingResponse) {
    return null
  }

  return (
    <div className="flex w-full flex-col gap-6 py-4">
      {messages.map((message, index) => (
        <ChatMessage
          agentImageUrl={agentImageUrl}
          agentName={agentName}
          avatarUrl={avatarUrl}
          isLastMessage={index === messages.length - 1}
          isStreaming={isStreaming && index === messages.length - 1}
          key={message.id}
          message={message}
        />
      ))}
      {isAwaitingResponse ? <ThinkingIndicator agentImageUrl={agentImageUrl} agentName={agentName} /> : null}
    </div>
  )
}
