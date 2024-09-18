import Image from "next/image"

import type { AssistantStatus, Message } from "ai"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"

import { ChatMessageActions } from "@/components/chat/chat-message-actions"
import { MemoizedReactMarkdown } from "@/components/markdown"
import { CodeBlock } from "@/components/ui/code-block"
import { IconUser, IconWeb3GPT } from "@/components/ui/icons"
import { nanoid } from "@/lib/utils"

export interface ChatMessageProps {
  message: Message
  status?: AssistantStatus
  avatarUrl?: string | null
}

export function ChatMessage({ message, avatarUrl, status }: ChatMessageProps) {

  return (
    <div className="group relative flex w-full mb-4 items-start md:-ml-12">
      <div className="relative flex size-8 shrink-0 select-none items-center justify-center overflow-hidden rounded-md border shadow ">
        {message.role === "user" ? (
          avatarUrl ? (
            <Image className="rounded-md" src={avatarUrl} alt={"user avatar"} fill={true} sizes="32px" />
          ) : (
            <IconUser />
          )
        ) : (
          <IconWeb3GPT />
        )}
      </div>
      <div className="ml-1 md:ml-4 flex-1 space-y-2 overflow-x-auto">
        <MemoizedReactMarkdown
          className="flex flex-col prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 max-w-full"
          remarkPlugins={[remarkGfm, remarkMath]}
          linkTarget="_blank"
          components={{
            p({ children }) {
              return <p className="mb-2 last:mb-0">{children}</p>
            },
            code({ inline, className, children }) {
              if (children.length) {
                if (children[0] === "▍") {
                  return <span className="mt-1 animate-pulse cursor-default">▍</span>
                }

                children[0] = (children[0] as string).replace("`▍`", "▍")
              }

              if (inline) {
                return <code className={className}>{children}</code>
              }

              const match = /language-(\w+)/.exec(className || "")

              return (
                <CodeBlock key={nanoid()} language={match?.[1] || ""} value={String(children).replace(/\n$/, "")} />
              )
            }
          }}
        >
          {message.content}
        </MemoizedReactMarkdown>
        {status === "in_progress" ? null : <ChatMessageActions message={message} />}
      </div>
    </div>
  )
}
