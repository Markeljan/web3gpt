'use client'

import Image from 'next/image'
import { useChat } from 'ai/react'
import toast from 'react-hot-toast'
import { nanoid } from '@/lib/utils'
import { functionSchemas } from '@/lib/functions/schemas'
import { PromptForm } from './prompt-form'
import { initialMessages } from '@/app/chat/page'

export function Landing({}) {
  const id = nanoid()

  const { messages, append, reload, stop, isLoading, input, setInput } =
    useChat({
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
    <div className="mx-auto max-w-2xl px-4 text-center">
      <div className="relative mb-16 mt-24 flex h-8 w-full">
        <Image
          src="/w3gpt_new.svg"
          alt="web3 gpt logo"
          fill
          sizes="(max-width: 318px) 100vw, 318px"
        />
      </div>
      <p className="scroll-m-20 text-2xl tracking-tight">
        Deploy smart contracts with AI
      </p>
      <div className="space-y-4 border-t bg-background px-4 py-2 shadow-lg sm:rounded-t-xl sm:border md:py-4">
        <PromptForm
          onSubmit={async value => {
            await append(
              {
                id,
                content: value,
                role: 'user'
              },
              { functions: functionSchemas }
            )
          }}
          input={input}
          setInput={setInput}
          isLoading={isLoading}
          showNewChatButton={false}
        />
      </div>
    </div>
  )
}
