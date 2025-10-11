import type { AssistantStatus, Message } from "ai"
import Image from "next/image"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"

import { ChatMessageActions } from "@/components/chat/chat-message-actions"
import { MemoizedReactMarkdown } from "@/components/markdown"
import { CodeBlock } from "@/components/ui/code-block"
import { IconUser, IconWeb3GPT } from "@/components/ui/icons"

export type ChatMessageProps = {
  message: Message
  status?: AssistantStatus
  avatarUrl?: string | null
}

const LANGUAGE_REGEX = /language-(\w+)/
const NEWLINE_REGEX = /\n$/

export function ChatMessage({ message, avatarUrl, status }: ChatMessageProps) {
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
          components={{
            p({ children }) {
              return <p className="mb-2 last:mb-0">{children}</p>
            },
            code({ inline, className, children }) {
              if (typeof children?.[0] === "string") {
                if (children[0] === "▍") {
                  return <span className="mt-1 animate-pulse cursor-default">▍</span>
                }

                children[0] = children[0].replace("`▍`", "▍")
              }

              if (inline) {
                return <code className={className}>{children}</code>
              }

              const match = LANGUAGE_REGEX.exec(className || "")

              return (
                <CodeBlock
                  key={message.id}
                  language={match?.[1] || ""}
                  value={String(children).replace(NEWLINE_REGEX, "")}
                />
              )
            },
          }}
          linkTarget="_blank"
          remarkPlugins={[remarkGfm, remarkMath]}
        >
          {message.content}
        </MemoizedReactMarkdown>
        {status === "in_progress" ? null : <ChatMessageActions message={message} />}
      </div>
    </div>
  )
}
