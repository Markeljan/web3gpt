"use client"

import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"

import { type Message, useAssistant } from "@ai-sdk/react"
import type { Session } from "next-auth"

import { AgentCard } from "@/components/agent-card"
import { ChatList } from "@/components/chat/chat-list"
import { ChatPanel } from "@/components/chat/chat-panel"
import { ChatScrollAnchor } from "@/components/chat/chat-scroll-anchor"
import { Landing } from "@/components/landing"
import { DEFAULT_AGENT } from "@/lib/config"
import type { Agent } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useGlobalStore } from "@/app/state/global-store"

type ChatProps = {
  className?: string
  agent?: Agent | null
  threadId?: string
  initialMessages?: Message[]
  session?: Session
}

export const Chat = ({ threadId, initialMessages = [], agent, className, session }: ChatProps) => {
  const avatarUrl = session?.user?.image
  const userId = session?.user?.id
  const router = useRouter()
  const {
    tokenScriptViewerUrl,
    lastDeploymentData,
    completedDeploymentReport,
    setCompletedDeploymentReport,
    setTokenScriptViewerUrl
  } = useGlobalStore()
  const {
    messages,
    status,
    stop,
    append,
    setMessages,
    threadId: threadIdFromAi
  } = useAssistant({
    threadId,
    api: "/api/assistants/threads/messages",
    body: {
      assistantId: agent?.id || DEFAULT_AGENT.id
    }
  })

  const isSmartToken = agent?.name.includes("Smart Token")

  // Ref for chat container
  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messages.length === 0 && initialMessages?.length > 0) {
      setMessages(initialMessages)
    }
  }, [initialMessages, messages, setMessages])

  useEffect(() => {
    if (userId && threadIdFromAi && threadIdFromAi !== threadId && status !== "in_progress") {
      router.replace(`/chat/${threadIdFromAi}`, { scroll: false })
    }
  }, [threadIdFromAi, threadId, router, status, userId])

  useEffect(() => {
    if (isSmartToken && lastDeploymentData && !completedDeploymentReport && status !== "in_progress") {
      const contractAddress = lastDeploymentData.address
      const chainId = lastDeploymentData.chainId
      console.log("new deployment detected ", lastDeploymentData)
      append({
        id: threadId,
        role: "system",
        content: `The user has successfully deployed a contract manually here are the details: \n\n Address: ${contractAddress} ChainId: ${chainId}`
      })
      setCompletedDeploymentReport(true)
    }
  }, [
    threadId,
    status,
    append,
    setCompletedDeploymentReport,
    lastDeploymentData,
    lastDeploymentData?.chainId,
    lastDeploymentData?.address,
    isSmartToken,
    completedDeploymentReport
  ])

  useEffect(() => {
    if (tokenScriptViewerUrl && completedDeploymentReport && status !== "in_progress") {
      append({
        id: threadId,
        role: "system",
        content: `The user has set the scriptURI and deployed the TokenScript here are the details for you to share with the user: \n\n${JSON.stringify(
          tokenScriptViewerUrl,
          null,
          2
        )}`
      })
      setTokenScriptViewerUrl(null)
    }
  }, [threadId, status, append, tokenScriptViewerUrl, completedDeploymentReport, setTokenScriptViewerUrl])

  // Scroll to bottom when deployment completes
  useEffect(() => {
    if (completedDeploymentReport && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [completedDeploymentReport])

  return (
    <>
      <div ref={chatContainerRef} className={cn("px-4 pb-[200px] pt-4 md:pt-10", className)}>
        {agent ? <AgentCard agent={agent} /> : <Landing userId={userId} />}
        <ChatList messages={messages} avatarUrl={avatarUrl} status={status} />
        <ChatScrollAnchor trackVisibility={status === "in_progress"} />
      </div>
      <ChatPanel stop={stop} append={append} status={status} />
    </>
  )
}
