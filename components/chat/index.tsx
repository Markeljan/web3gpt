"use client"

import { useEffect, useState } from "react"

import type { ChatRequest, FunctionCallHandler } from "ai"
import { useAssistant } from "ai/react"
import toast from "react-hot-toast"
import { useAccount, useChains } from "wagmi"

import { useGlobalStore } from "@/app/state/global-store"
import { ChatList } from "@/components/chat/chat-list"
import { ChatPanel } from "@/components/chat/chat-panel"
import { ChatScrollAnchor } from "@/components/chat/chat-scroll-anchor"
import { functionSchemas } from "@/lib/functions/schemas"
import { useW3GPTDeploy } from "@/lib/hooks/use-w3gpt-deploy"
import { cn } from "@/lib/utils"
import { nanoid } from "@/lib/utils"
// import { FileViewer } from "@/components/file-viewer"

export type ChatProps = {
  className?: string
  threadId?: string
}

const Chat = ({ threadId, className }: ChatProps) => {
  const { setIsDeploying, setDeployContractConfig, verifyContractConfig, lastDeploymentData, setLastDeploymentData } =
    useGlobalStore()
  const [chatThreadId, setChatThreadId] = useState(threadId)
  const supportedChains = useChains()
  const { chain } = useAccount()
  const isSupportedChain = !!(chain && supportedChains.find((c) => c.id === chain.id))
  const activeChainId = isSupportedChain ? chain.id : 5003
  const { deploy } = useW3GPTDeploy({ chainId: activeChainId })

  const { messages, status, input, submitMessage, handleInputChange } = useAssistant({
    threadId: chatThreadId,
    api: `/api/assistants/threads/${chatThreadId}/messages`
  })
  const isLoading = status === "in_progress"

  useEffect(() => {
    const createThread = async () => {
      const res = await fetch("/api/assistants/threads", {
        method: "POST"
      })
      const { threadId } = await res.json()

      setChatThreadId(threadId)
    }
    if (!chatThreadId) {
      createThread()
    }
  }, [chatThreadId])

  useEffect(() => {
    let isMounted = true

    async function verifyContract() {
      if (!verifyContractConfig?.deployHash || lastDeploymentData?.verificationStatus === "success") {
        return
      }

      try {
        const response = await fetch("/api/verify-contract", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(verifyContractConfig)
        })

        const data = await response.json()

        if (typeof data === "string" && data.startsWith("0x") && isMounted) {
          toast.success("Contract verified successfully!")
          lastDeploymentData &&
            setLastDeploymentData({
              ...lastDeploymentData,
              verificationStatus: "success"
            })
        } else {
          setTimeout(verifyContract, 15000) // Retry after 15 seconds
        }
      } catch (error) {
        console.error("Verification failed", error)
        setTimeout(verifyContract, 15000) // Retry after 15 seconds
      }
    }

    verifyContract()

    return () => {
      isMounted = false
    }
  }, [lastDeploymentData, verifyContractConfig, setLastDeploymentData])

  const _functionCallHandler: FunctionCallHandler = async (chatMessages, functionCall) => {
    if (functionCall.name === "deploy_contract") {
      setIsDeploying(true)
      const { chainId, contractName, sourceCode, constructorArgs } = JSON.parse(functionCall.arguments || "{}")

      setDeployContractConfig({
        chainId: chainId || activeChainId,
        contractName,
        sourceCode,
        constructorArgs
      })
      console.log("Deploying contract")
      const verifiedContractAddress = await deploy({
        chainId: chainId || activeChainId,
        contractName,
        sourceCode,
        constructorArgs
      })

      const functionResponse: ChatRequest = {
        messages: [
          ...chatMessages,
          {
            id: nanoid(),
            name: "deploy_contract",
            role: "function",
            content: JSON.stringify({ verifiedContractAddress })
          }
        ],
        functions: functionSchemas
      }
      return functionResponse
    }
    if (functionCall.name === "text_to_image") {
      const response = await fetch("/api/text-to-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
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
            name: "text-to-image",
            role: "function",
            content: JSON.stringify({ imageUrl, metadataUrl })
          }
        ],
        functions: functionSchemas
      }
      return functionResponse
    }
  }

  return (
    <>
      <div className={cn("px-4 pb-[200px] pt-4 md:pt-10", className)}>
        <ChatList isLoading={isLoading} messages={messages} />
        <ChatScrollAnchor trackVisibility={isLoading} />
      </div>
      {/* <FileViewer /> */}
      <ChatPanel submitMessage={submitMessage} input={input} handleInputChange={handleInputChange} status={status} />
    </>
  )
}

export default Chat
