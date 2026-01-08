import type { Message } from "ai"
import Image from "next/image"
import type { Components } from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"

import { ChatMessageActions } from "@/components/chat/chat-message-actions"
import { MemoizedReactMarkdown } from "@/components/markdown"
import { CodeBlock } from "@/components/ui/code-block"
import { IconUser, IconWeb3GPT } from "@/components/ui/icons"

export type ChatMessageProps = {
  message: Message
  isLoading?: boolean
  avatarUrl?: string | null
}

const LANGUAGE_REGEX = /language-(\w+)/
const NEWLINE_REGEX = /\n$/

type ContentPart = { type: string; text?: string }

function getMessageContent(content: Message["content"]): string {
  if (typeof content === "string") {
    return content
  }
  if (Array.isArray(content)) {
    return (content as ContentPart[])
      .filter((part) => part.type === "text" && typeof part.text === "string")
      .map((part) => part.text as string)
      .join("")
  }
  return ""
}

export function ChatMessage({ message, avatarUrl, isLoading }: ChatMessageProps) {
  // Extract text content from message - handle both string and array content
  const messageContent = getMessageContent(message.content)

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

  return (
    <div className="group md:-ml-12 relative mb-4 flex w-full items-start">
      <div className="relative flex size-8 shrink-0 select-none items-center justify-center overflow-hidden rounded-md border shadow">
        {message.role === "user" ? (
          avatarUrl ? (
            <Image alt={"user avatar"} className="rounded-md" fill={true} sizes="32px" src={avatarUrl} />
          ) : (
            <IconUser />
          )
        ) : (
          <IconWeb3GPT />
        )}
      </div>
      <div className="ml-1 flex-1 space-y-2 overflow-x-auto md:ml-4">
        <MemoizedReactMarkdown
          className="prose dark:prose-invert flex max-w-full flex-col break-words prose-pre:p-0 prose-p:leading-relaxed"
          components={components}
          remarkPlugins={[remarkGfm, remarkMath]}
        >
          {messageContent}
        </MemoizedReactMarkdown>
        {isLoading ? null : <ChatMessageActions message={message} />}
      </div>
    </div>
  )
}
