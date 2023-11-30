'use client'

import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { Message } from 'ai'
import Image from 'next/image'

import { cn } from '@/lib/utils'
import { CodeBlock } from '@/components/ui/codeblock'
import { MemoizedReactMarkdown } from '@/components/markdown'
import { IconF, IconUser, IconW3GPT } from '@/components/ui/icons'
import { ChatMessageActions } from '@/components/chat-message-actions'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from './ui/dialog'
import { Badge } from './ui/badge'

export interface ChatMessageProps {
  message: Message
  avatarUrl?: string | null | undefined
}

export function ChatMessage({
  message,
  avatarUrl,
  ...props
}: ChatMessageProps) {
  // Handler for wallet-less deploy
  const handleWalletLessDeploy = () => {
    // TODO: Implement wallet-less deploy logic
    console.log('Wallet-less deploy triggered')
  }

  // Handler for deploy with wallet
  const handleDeployWithWallet = () => {
    // TODO: Implement deploy with wallet logic
    console.log('Deploy with wallet triggered')
  }

  if (message.function_call) {
    return (
      <div
        className="group relative mb-4 flex items-start md:-ml-12"
        {...props}
      >
        <div className="ml-4 flex w-full justify-end">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-3/4 py-6" variant="default" size="lg">
                Deploy Contract
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Deploy Contract</DialogTitle>
                <DialogDescription>
                  Select your preferred deployment method.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium">
                    Wallet-less Deploy
                    <Badge
                      variant="secondary"
                      className="ml-2 rounded bg-green-500 px-2"
                    >
                      RECOMMENDED
                    </Badge>
                  </p>
                  <p className="text-sm text-gray-500">
                    Web3 GPT will deploy the contract for you. TIP: you can pass
                    your address to the contract constructor to make yourself
                    the owner.
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium">
                    Deploy using Wallet
                    <Badge variant="destructive" className="ml-2 rounded px-2">
                      WARNING
                    </Badge>
                  </p>
                  <p className="text-sm text-gray-500">
                    Connect your wallet to deploy the contract. Be aware that
                    this creates a real transaction on the blockchain. For added
                    safety sending ETH on deployment is disabled (except for gas
                    fees).
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleWalletLessDeploy} variant="default">
                  Wallet-less Deploy
                </Button>
                <Button onClick={handleDeployWithWallet} variant="secondary">
                  Deploy using Wallet
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <ChatMessageActions message={message} />
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
          'relative flex h-8 w-8 shrink-0 select-none items-center justify-center overflow-hidden rounded-md border shadow '
        )}
      >
        {message.role === 'user' ? (
          avatarUrl ? (
            <Image
              className="rounded-md"
              src={avatarUrl}
              alt={'user avatar'}
              fill={true}
              sizes="32px"
            />
          ) : (
            <IconUser />
          )
        ) : message.function_call ? (
          <IconF />
        ) : (
          <IconW3GPT />
        )}
      </div>
      <div className="ml-4 flex-1 space-y-2 overflow-x-auto">
        <MemoizedReactMarkdown
          className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"
          remarkPlugins={[remarkGfm, remarkMath]}
          linkTarget={'_blank'}
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
          <ChatMessageActions message={message} />
        </div>
      </div>
    </div>
  )
}
