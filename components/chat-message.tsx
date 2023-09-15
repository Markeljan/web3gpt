'use client'

import { useState } from 'react'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { Message } from 'ai'
import Image from 'next/image'

import { cn } from '@/lib/utils'
import { CodeBlock } from '@/components/ui/codeblock'
import { MemoizedReactMarkdown } from '@/components/markdown'
import { IconF, IconUser } from '@/components/ui/icons'
import { ChatMessageActions } from '@/components/chat-message-actions'
import { Button } from '@/components/ui/button'

export interface ChatMessageProps {
  message: Message
  avatarUrl?: string
}

export function ChatMessage({
  message,
  avatarUrl,
  ...props
}: ChatMessageProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const onExpandClick = () => setIsExpanded(!isExpanded)
  if (message.function_call && !isExpanded) {
    return (
      <div
        className="group relative mb-4 flex items-start md:-ml-12"
        {...props}
      >
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-primary text-primary-foreground shadow">
          <IconF />
        </div>
        <div className="ml-4 flex-1 space-y-2 px-1">
          <Button onClick={onExpandClick} variant="default">
            Function Call
          </Button>
          <ChatMessageActions message={message} onExpandClick={onExpandClick} />
        </div>
      </div>
    )
  }
  return (
    <div
      className={cn('group relative mb-4 flex items-start md:-ml-12')}
      {...props}
    >
      <div
        className={cn(
          'relative flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow'
        )}
      >
        {message.role === 'user' ? (
          avatarUrl ? (
            <Image
              className="rounded-md"
              src={avatarUrl}
              alt={'user avatar'}
              fill={true}
              sizes='30px'
            />
          ) : (
            <IconUser />
          )
        ) : message.function_call ? (
          <IconF />
        ) : (
          <Image
            className="rounded-md"
            src={'/favicon.png'}
            alt={'web3 gpt logo'}
            fill={true}
            sizes='30px'
          />
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
                if (children[0] == '▍') {
                  return (
                    <span className="mt-1 animate-pulse cursor-default">▍</span>
                  )
                }

                children[0] = (children[0] as string).replace('`▍`', '▍')
              }

              const match = /language-(\w+)/.exec(className || '')

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
                  language={(match && match[1]) || ''}
                  value={String(children).replace(/\n$/, '')}
                  {...props}
                />
              )
            }
          }}
        >
          {message.content === ''
            ? typeof message.function_call === 'string'
              ? message.function_call
              : JSON.stringify(message.function_call)
            : message.content ?? ''}
        </MemoizedReactMarkdown>
        <div className="flex flex-col justify-end">
          <ChatMessageActions message={message} onExpandClick={onExpandClick} />
        </div>
      </div>
    </div>
  )
}
