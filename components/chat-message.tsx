'use client'

import React, { useState } from 'react'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

import { cn } from '@/lib/utils'
import { CodeBlock } from '@/components/ui/codeblock'
import { MemoizedReactMarkdown } from '@/components/markdown'
import { IconF, IconOpenAI, IconUser } from '@/components/ui/icons'
import { ChatMessageActions } from '@/components/chat-message-actions'
import { Message } from 'ai'
import { Button } from './ui/button'

export interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message, ...props }: ChatMessageProps) {
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
        <div className="ml-4 flex-1 space-y-2 overflow-hidden px-1">
          <Button
            onClick={onExpandClick}
            className="flex justify-start rounded bg-primary p-2 text-primary-foreground"
          >
            <span>Function Call</span>
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
          'flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow',
          message.role === 'user'
            ? 'bg-background'
            : 'bg-primary text-primary-foreground'
        )}
      >
        {message.role === 'user' ? (
          <IconUser />
        ) : message.function_call ? (
          <IconF />
        ) : (
          <IconOpenAI />
        )}
      </div>
      <div className="ml-4 flex-1 space-y-2 overflow-hidden px-1">
        <MemoizedReactMarkdown
          className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"
          remarkPlugins={[remarkGfm, remarkMath]}
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
        <ChatMessageActions message={message} onExpandClick={onExpandClick} />
      </div>
    </div>
  )
}
