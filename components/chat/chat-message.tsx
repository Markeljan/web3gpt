"use client"

import Image from "next/image"
import { useState } from "react"

import type { Message } from "ai"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"

import { ChatMessageActions } from "@/components/chat/chat-message-actions"
import { MemoizedReactMarkdown } from "@/components/markdown"
import { Button } from "@/components/ui/button"
import { CodeBlock } from "@/components/ui/codeblock"
import { IconF, IconUser, IconW3GPT } from "@/components/ui/icons"
import { useAvatar } from "@/lib/hooks/use-avatar"
import { cn } from "@/lib/utils"

export interface ChatMessageProps {
  className?: string
  message: Message
}

export function ChatMessage({ message, className, ...props }: ChatMessageProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const avatarUrl = useAvatar()

  const onExpandClick = () => setIsExpanded(!isExpanded)

  console.log("message", message)

  // if (message.function_call && !isExpanded) {
  //   return (
  //     <div className={cn("group relative mb-4 flex items-start md:-ml-12", className)} {...props}>
  //       <div className="flex size-8 shrink-0 select-none items-center justify-center rounded-md border bg-primary text-primary-foreground shadow">
  //         <IconF />
  //       </div>
  //       <div className="ml-4 flex-1 space-y-2 px-1">
  //         <Button onClick={onExpandClick} variant="default">
  //           Function Call
  //         </Button>
  //         <ChatMessageActions message={message} onExpandClick={onExpandClick} />
  //       </div>
  //     </div>
  //   )
  // }

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
        ) : message.function_call ? (
          <div className="flex size-8 shrink-0 select-none items-center justify-center rounded-md border bg-primary text-primary-foreground shadow">
            <IconF />
          </div>
        ) : (
          <IconW3GPT />
        )}
      </div>
      <div className="ml-4 flex-1 space-y-2 overflow-x-auto">
        <MemoizedReactMarkdown
          className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"
          remarkPlugins={[remarkGfm, remarkMath]}
          linkTarget={"_blank"}
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

              return (
                <CodeBlock
                  key={Math.random()}
                  language={match?.[1] || ""}
                  value={String(children).replace(/\n$/, "")}
                  {...props}
                />
              )
            }
          }}
        >
          {message.content === ""
            ? typeof message.function_call === "string"
              ? message.function_call
              : JSON.stringify(message.function_call)
            : message.content ?? ""}
        </MemoizedReactMarkdown>
        <div className="flex flex-col justify-end">
          <ChatMessageActions message={message} onExpandClick={onExpandClick} />
        </div>
      </div>
    </div>
  )
}
