import type { UIMessage } from "ai"
import Image from "next/image"
import type { Components } from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import { ChatMessageActions } from "@/components/chat/chat-message-actions"
import { CodeBlock } from "@/components/code-block"
import { IconUser, IconWeb3GPT } from "@/components/icons"
import { MemoizedReactMarkdown } from "@/components/markdown"
import { Reasoning, ReasoningContent, ReasoningTrigger } from "@/components/reasoning"
import type { LegacyMessage } from "@/lib/types"

export type ChatMessageProps = {
  message: UIMessage | LegacyMessage
  isLoading?: boolean
  isStreaming?: boolean
  isLastMessage?: boolean
  avatarUrl?: string | null
}

const LANGUAGE_REGEX = /language-(\w+)/
const NEWLINE_REGEX = /\n$/

type MessagePart = {
  type: string
  text?: string
  reasoning?: string
}

// Helper function to extract parts from both v4 (content) and v5 (parts) message formats
function getMessageParts(message: UIMessage | LegacyMessage): MessagePart[] {
  // Handle v5 format (parts array)
  const parts = "parts" in message ? message.parts : undefined
  if (parts && Array.isArray(parts) && parts.length > 0) {
    return parts as MessagePart[]
  }

  // Handle v4 format (content property) for backward compatibility
  if ("content" in message && message.content) {
    const content = message.content
    if (typeof content === "string") {
      return [{ type: "text", text: content }]
    }
    if (Array.isArray(content)) {
      return content as MessagePart[]
    }
  }

  return []
}

export function ChatMessage({
  message,
  avatarUrl,
  isLoading,
  isStreaming = false,
  isLastMessage = false,
}: ChatMessageProps) {
  // Extract parts from message - handle both v4 (content) and v5 (parts) formats
  const messageParts = getMessageParts(message)

  const components: Components = {
    p({ children }) {
      return <p className="mb-2 last:mb-0">{children}</p>
    },
    a({ href, children }) {
      return (
        <a href={href} rel="noopener noreferrer" target="_blank">
          {children}
        </a>
      )
    },
    code({ className, children, ...props }) {
      const childArray = Array.isArray(children) ? children : [children]

      if (typeof childArray?.[0] === "string" && childArray[0] === "▍") {
        return <span className="mt-1 animate-pulse cursor-default">▍</span>
      }

      // Check if this is an inline code block (no language class and short content)
      const match = LANGUAGE_REGEX.exec(className || "")
      const isInline = !(match || className?.includes("language-"))

      if (isInline) {
        return (
          <code className={className} {...props}>
            {children}
          </code>
        )
      }

      return (
        <CodeBlock key={message.id} language={match?.[1] || ""} value={String(children).replace(NEWLINE_REGEX, "")} />
      )
    },
  }

  const renderAvatar = () => {
    if (message.role === "user") {
      if (avatarUrl) {
        return <Image alt={"user avatar"} className="rounded-md" fill={true} sizes="32px" src={avatarUrl} />
      }
      return <IconUser />
    }
    return <IconWeb3GPT />
  }

  const renderMessageParts = () => {
    return messageParts.map((part, index) => {
      const isLastPart = index === messageParts.length - 1
      const isPartStreaming = isStreaming && isLastMessage && isLastPart

      switch (part.type) {
        case "reasoning":
          return (
            <Reasoning isStreaming={isPartStreaming} key={`${message.id}-reasoning-${index}`}>
              <ReasoningTrigger />
              <ReasoningContent>{part.reasoning || ""}</ReasoningContent>
            </Reasoning>
          )
        case "text":
          return (
            <MemoizedReactMarkdown
              className="prose dark:prose-invert flex max-w-full flex-col break-words prose-pre:p-0 prose-p:leading-relaxed"
              components={components}
              key={`${message.id}-text-${index}`}
              remarkPlugins={[remarkGfm, remarkMath]}
            >
              {part.text || ""}
            </MemoizedReactMarkdown>
          )
        default:
          return null
      }
    })
  }

  return (
    <div className="group relative mb-4 flex w-full items-start md:-ml-12">
      <div className="relative flex size-8 shrink-0 select-none items-center justify-center overflow-hidden rounded-md border shadow">
        {renderAvatar()}
      </div>
      <div className="ml-1 flex-1 space-y-2 overflow-x-auto md:ml-4">
        {renderMessageParts()}
        {isLoading ? null : <ChatMessageActions message={message} />}
      </div>
    </div>
  )
}
