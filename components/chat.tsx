'use client'

import { ChatRequest, FunctionCallHandler } from 'ai'
import { useChat, type Message } from 'ai/react'
import toast from 'react-hot-toast'

import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { ChatScrollAnchor } from '@/components/chat-scroll-anchor'
import { nanoid } from '@/lib/utils'
import { functionSchemas } from '@/lib/functions/schemas'
import { useEffect } from 'react'
import { createPublicClient, http } from 'viem'
import { VerifyContractConfig } from '@/lib/functions/types'
import { Landing } from '@/components/landing'
import { useGlobalStore } from '@/app/state/global-store'

export interface ChatProps extends React.ComponentProps<'div'> {
  initialMessages?: Message[]
  id?: string
  showLanding?: boolean
  avatarUrl?: string | null | undefined
}

export function Chat({
  id,
  initialMessages,
  className,
  showLanding = false,
  avatarUrl
}: ChatProps) {
  const { isDeploying, verifyContractConfig, isVerifying, setIsVerifying } =
    useGlobalStore()

  const functionCallHandler: FunctionCallHandler = async (
    chatMessages,
    functionCall
  ) => {
    if (functionCall.name === 'text_to_image') {
      const response = await fetch('/api/text-to-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: functionCall.arguments })
      })
      if (!response.ok) {
        throw new Error(response.statusText)
      }
      const { imageUrl, metadataUrl } = await response.json()

      const functionResponse: ChatRequest = {
        messages: [
          ...chatMessages,
          {
            id: nanoid(),
            name: 'text-to-image',
            role: 'function',
            content: JSON.stringify({ imageUrl, metadataUrl })
          }
        ],
        functions: functionSchemas
      }
      return functionResponse
    }
  }

  const { messages, append, reload, stop, isLoading, input, setInput } =
    useChat({
      experimental_onFunctionCall: functionCallHandler,
      initialMessages,
      id,
      body: {
        id
      },
      onResponse(response) {
        if (response.status === 401) {
          toast.error(response.statusText)
        }
      }
    })

  return (
    <>
      <div className={cn('px-4 pb-[200px] pt-4 md:pt-10', className)}>
        {showLanding && <Landing />}
        <ChatList messages={messages} avatarUrl={avatarUrl} />
        <ChatScrollAnchor trackVisibility={isLoading} />
      </div>
      <ChatPanel
        id={id}
        isLoading={isLoading || isDeploying}
        stop={stop}
        append={append}
        reload={reload}
        messages={messages}
        input={input}
        setInput={setInput}
      />
    </>
  )
}
