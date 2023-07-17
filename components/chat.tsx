'use client'

import { ChatRequest, FunctionCallHandler } from "ai";
import { useChat, type Message } from "ai/react";
import toast from 'react-hot-toast'

import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { EmptyScreen } from '@/components/empty-screen'
import { ChatScrollAnchor } from '@/components/chat-scroll-anchor'
import { nanoid } from '@/lib/utils'
import { functionSchemas } from "@/lib/functions/schemas";
import { useEffect, useState } from "react";

export interface ChatProps extends React.ComponentProps<'div'> {
  initialMessages?: Message[]
  id?: string
}


export function Chat({ id, initialMessages, className }: ChatProps) {
  // const [verificationParams, setVerificationParams] = useState(null)
  // const [polling, setPolling] = useState(false)

  async function retryBackendVerifyUntilSuccess(verificationParams: any, countdown = 20): Promise<string | null> {
    try {
      const verifyResponse = await fetch(
        '/api/verify-contract',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(verificationParams)
        });
      const json = (await verifyResponse.text()) as unknown as (string | null);
      console.log('verifyResponse:', {status: verifyResponse.status, statusText: verifyResponse.statusText, json: json, ok: verifyResponse.ok});
      if (json != null) {
        console.log('verification succeeded! contract address:', json);
        return json;
      } else if (countdown == 0) {
        console.log('gave up trying to verify contract after retries');
        return null;
      } else {
        console.log('trying again in 10 seconds');
        await new Promise(r => setTimeout(r, 10000));
        return await retryBackendVerifyUntilSuccess(verificationParams, countdown - 1);
      }
    } catch (e) {
      console.log('Verification failed, may more confirmations.', e, (e as Error).stack);
      return null;
    }
  }


  const functionCallHandler: FunctionCallHandler = async (
    chatMessages,
    functionCall
  ) => {
    if (functionCall.name === 'get_current_time') {
      const time = new Date().toLocaleTimeString()
      const functionResponse: ChatRequest = {
        messages: [
          ...chatMessages,
          {
            id: nanoid(),
            name: 'get_current_time',
            role: 'function',
            content: JSON.stringify({ time })
          }
        ]
        // You can also (optionally) return a list of functions here that the model can call next
        // functions
      }

      return functionResponse

    } else if (functionCall.name === 'deploy_contract') {
      // You now have access to the parsed arguments here (assuming the JSON was valid)
      // If JSON is invalid, return an appropriate message to the model so that it may retry?

      const response = await fetch(
        '/api/deploy-contract',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: functionCall.arguments
        });

      let content: string;
      let role: 'system' | 'function';

      const json = await response.json();
      console.log('response status:', response.status);
      console.log('deploy contract response json:', json);

      if (response.ok) {
        const { explorerUrl, ipfsUrl, verificationParams } = json;
        const verifiedContractAddress = await retryBackendVerifyUntilSuccess(verificationParams);
        content = JSON.stringify({ explorerUrl, ipfsUrl, verifiedContractAddress, verifiedSmartContractUrl: verifiedContractAddress && ('https://explorer.testnet.mantle.xyz/address/' + verifiedContractAddress), contractVerificationResult: verifiedContractAddress != null ? 'success' : 'failure' })
        console.log('passing content to gpt:', content);
        role = 'function'

      } else {
        const { error } = json
        content = JSON.stringify({ error }) + '\n\n' + 'Deploy again fixing the error.'
        role = 'system' //'system'
      }

      const functionResponse: ChatRequest = {
        messages: [
          ...chatMessages,
          {
            id: nanoid(),
            name: 'deploy_contract',
            role: role,
            content: content,
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
      <div className={cn('pb-[200px] pt-4 md:pt-10', className)}>
        {messages.length > 1 ? (
          <>
            <ChatList messages={messages} />
            <ChatScrollAnchor trackVisibility={isLoading} />
          </>
        ) : (
          <EmptyScreen setInput={setInput} />
        )}
      </div>
      <ChatPanel
        id={id}
        isLoading={isLoading}
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
