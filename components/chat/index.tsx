"use client"

import type { ChatRequest, FunctionCallHandler } from "ai"
import { useAssistant } from "ai/react"
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

const Chat = ({ threadId: clientThreadId, className }: ChatProps) => {
  const { setIsDeploying, setDeployContractConfig, verifyContractConfig, lastDeploymentData, setLastDeploymentData } =
    useGlobalStore()
  const supportedChains = useChains()
  const { chain } = useAccount()
  const isSupportedChain = !!(chain && supportedChains.find((c) => c.id === chain.id))
  const activeChainId = isSupportedChain ? chain.id : 5003
  const { deploy } = useW3GPTDeploy({ chainId: activeChainId })

  const { messages, status, input, submitMessage, handleInputChange, threadId } = useAssistant({
    threadId: clientThreadId,
    api: "/api/assistants/threads/messages"
  })

  if (!clientThreadId) {
    clientThreadId = threadId
  }

  const isLoading = status === "in_progress"

  // useEffect(() => {
  //   const createThread = async () => {
  //     const res = await fetch("/api/assistants/threads", {
  //       method: "POST"
  //     })
  //     const { threadId } = await res.json()
  //     console.log("threadId", threadId)

  //     setChatThreadId(threadId)
  //   }
  //   if (!chatThreadId) {
  //     createThread()
  //   }
  // }, [chatThreadId])

  // useEffect(() => {
  //   let isMounted = true

  //   async function verifyContract() {
  //     if (!verifyContractConfig?.deployHash || lastDeploymentData?.verificationStatus === "success") {
  //       return
  //     }

  //     try {
  //       const response = await fetch("/api/verify-contract", {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json"
  //         },
  //         body: JSON.stringify(verifyContractConfig)
  //       })

  //       const data = await response.json()

  //       if (typeof data === "string" && data.startsWith("0x") && isMounted) {
  //         toast.success("Contract verified successfully!")
  //         lastDeploymentData &&
  //           setLastDeploymentData({
  //             ...lastDeploymentData,
  //             verificationStatus: "success"
  //           })
  //       } else {
  //         setTimeout(verifyContract, 15000) // Retry after 15 seconds
  //       }
  //     } catch (error) {
  //       console.error("Verification failed", error)
  //       setTimeout(verifyContract, 15000) // Retry after 15 seconds
  //     }
  //   }

  //   verifyContract()

  //   return () => {
  //     isMounted = false
  //   }
  // }, [lastDeploymentData, verifyContractConfig, setLastDeploymentData])

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
