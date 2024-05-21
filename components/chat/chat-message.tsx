import Image from "next/image"

import type { Message } from "ai"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"

import { ChatMessageActions } from "@/components/chat/chat-message-actions"
import { MemoizedReactMarkdown } from "@/components/markdown"
import { CodeBlock } from "@/components/ui/code-block"
import { IconUser, IconW3GPT } from "@/components/ui/icons"
import { cn } from "@/lib/utils"

export interface ChatMessageProps {
  className?: string
  message: Message
  avatarUrl?: string | null
}

export function ChatMessage({ message, avatarUrl, className, ...props }: ChatMessageProps) {
  return (
    <div className={cn("group relative mb-4 flex items-start md:-ml-12")} {...props}>
      <div
        className={cn(
          "relative flex size-8 shrink-0 select-none items-center justify-center overflow-hidden rounded-md border shadow "
        )}
      >
        {message.role === "user" ? (
          avatarUrl ? (
            <Image className="rounded-md" src={avatarUrl} alt={"user avatar"} fill={true} sizes="32px" />
          ) : (
            <IconUser />
          )
        ) : (
          <IconW3GPT />
        )}
      </div>
      <div className="ml-4 flex-1 space-y-2 overflow-x-auto">
        <MemoizedReactMarkdown
          className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"
          remarkPlugins={[remarkGfm, remarkMath]}
          linkTarget="_blank"
          components={{
            p({ children }) {
              return <p className="mb-2 last:mb-0">{children}</p>
            },
            code({ node, inline, className, children, ...props }) {
              if (children.length) {
                if (children[0] === "▍") {
                  return <span className="mt-1 animate-pulse cursor-default">▍</span>
                }

                children[0] = (children[0] as string).replace("`▍`", "▍")
              }

              const match = /language-(\w+)/.exec(className || "")

              if (inline) {
                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                )
              }

              const value = String(children).replace(/\n$/, "")

              const language = match?.[1] || ""

              return <CodeBlock key={Math.random()} language={language} value={value} {...props} />
            }
          }}
        >
          {message.content}
        </MemoizedReactMarkdown>

        <ChatMessageActions message={message} />
      </div>
    </div>
  )
}
