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
import { useState } from "react";
import { Session } from "next-auth";

export interface ChatProps extends React.ComponentProps<'div'> {
  initialMessages?: Message[];
  id?: string;
  session?: Session;
}

export function Chat({ id, initialMessages, className, session }: ChatProps) {
  const [overlayText, setOverlayText] = useState("");

  function clearOverlay() {
    setOverlay("");
    clearContractText();
  }

  function setOverlay(text: string) {
    setOverlayText(text.trim());
  }

  const [contractText, setContractText] = useState("");

  function clearContractText() {
    setContractText("");
  }

  // countdown = 10 with ~3sec for each retry = maximum 30 seconds waiting time before timing out and returning to the user
  async function retryBackendVerifyUntilSuccess(verificationParams: any, countdown = 5, potentialAddress?: string): Promise<string | null> {
    console.log("trying verification with countdown:", countdown);
    const verifyResponse = await fetch(
      '/api/verify-contract',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(verificationParams)
      });
    const json = (await verifyResponse.json()) as unknown as (string | null);
    console.log('verifyResponse:', {status: verifyResponse.status, statusText: verifyResponse.statusText, json: json, ok: verifyResponse.ok});
    if (countdown == 0) {
      console.log('gave up trying to verify contract after retries');
      return potentialAddress ?? null;
    } else if (json == "already_verified") {
      console.log("got already_verified, verification was successful!");
      return potentialAddress ?? null;
    } else if (json != null) {
      console.log('success response from verification, waiting for already_verified');
      await new Promise(r => setTimeout(r, 2500));
      return await retryBackendVerifyUntilSuccess(verificationParams, countdown - 1, json);
    } else {
      console.log('trying again in 10 seconds');
      await new Promise(r => setTimeout(r, 5000));
      return await retryBackendVerifyUntilSuccess(verificationParams, countdown - 1, potentialAddress);
    }
  }


  const functionCallHandler: FunctionCallHandler = async (
    chatMessages,
    functionCall
  ) => {
    console.log("functionCallHandler called with functionCall:", functionCall);
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

      try {
        if (functionCall.arguments != null) {
          const contractCode = JSON.parse(functionCall.arguments).sourceCode;

          console.log("Deploying smart contract -- code:", contractCode);

          setOverlay("Deploying contract...");
          contractCode && setContractText(contractCode);
        }
      } catch (e) {console.log("failed to show contract code in overlay");}

      const response = await fetch(
        '/api/deploy-contract',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: functionCall.arguments
        });

      setOverlay("Deployment complete!");

      let content: string;
      let role: 'system' | 'function';

      const json = await response.json();
      console.log('response status:', response.status);
      console.log('deploy contract response json:', json);

      if (response.ok) {
        const { explorerUrl, ipfsUrl, verificationParams } = json;
        setOverlay("Deployment complete! Verifying contract...");
        const verifiedContractAddress = await retryBackendVerifyUntilSuccess(verificationParams);
        clearOverlay();
        content = JSON.stringify({ explorerUrl, ipfsUrl, verifiedContractAddress, verifiedSmartContractUrl: verifiedContractAddress && ('https://explorer.testnet.mantle.xyz/address/' + verifiedContractAddress), contractVerificationResult: verifiedContractAddress != null ? 'success' : 'failure' })
        console.log('passing content to gpt:', content);
        role = 'function'

      } else {
        clearOverlay();
        console.log(json);
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
            <ChatList messages={messages} session={session}/>
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

      {/* {overlayText && (
        <div className="overlay">
          <div className="overlay-content">
            <code className="mt-5">{overlayText}</code>
          </div>
        </div>
      )} */}

      {overlayText && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="p-8 bg-white rounded shadow-lg flex flex-col items-center">
            <div className="flex items-center mb-4">
              <div className="animate-spin mr-4">
                <div className="border-t-4 border-gray-600 rounded-full h-6 w-6"></div>
              </div>
              <div className="font-bold text-lg text-gray-600">{overlayText}</div>
            </div>
            {contractText && (
              <pre className="p-4 bg-black text-green-400 rounded max-w-[800px] max-h-[400px] overflow-auto">{contractText}</pre>
            )}
          </div>
        </div>
      )}
    </>
  )
}
