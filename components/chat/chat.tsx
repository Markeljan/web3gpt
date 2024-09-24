"use client"

import { useEffect, useRef } from "react"

import { type Message, useAssistant } from "@ai-sdk/react"

import { useGlobalStore } from "@/app/state/global-store"
import { AgentCard } from "@/components/agent-card"
import { ChatList } from "@/components/chat/chat-list"
import { ChatPanel } from "@/components/chat/chat-panel"
import { ChatScrollAnchor } from "@/components/chat/chat-scroll-anchor"
import { Landing } from "@/components/landing"
import { DEFAULT_AGENT } from "@/lib/config"
import { useScrollToBottom } from "@/lib/hooks/use-scroll-to-bottom"
import type { Agent } from "@/lib/types"
import { cn } from "@/lib/utils"

type ChatProps = {
  agent?: Agent
  className?: string
  initialThreadId?: string
  initialMessages?: Message[]
  userId?: string
  avatarUrl?: string | null
}

export const Chat = ({
  initialThreadId,
  initialMessages = [],
  agent = DEFAULT_AGENT,
  className,
  userId,
  avatarUrl
}: ChatProps) => {
  const isSmartToken = agent.name.includes("Smart Token")
  const {
    tokenScriptViewerUrl,
    lastDeploymentData,
    completedDeploymentReport,
    setCompletedDeploymentReport,
    setTokenScriptViewerUrl
  } = useGlobalStore()
  const { messages, status, setThreadId, stop, append, setMessages, threadId } = useAssistant({
    threadId: initialThreadId,
    api: "/api/assistants/threads/messages",
    body: {
      assistantId: agent.id
    }
  })
  const chatRef = useRef<HTMLDivElement>(null)
  const { scrollToBottom } = useScrollToBottom(chatRef)

  useEffect(() => {
    if (messages.length === 2 && !initialThreadId && threadId && status !== "in_progress") {
      history.pushState(null, "", `/chat/${threadId}`)
    }
  }, [messages, initialThreadId, status, threadId])

  useEffect(() => {
    if (messages.length === 0 && initialMessages?.length > 0) {
      setMessages(initialMessages)
      setTimeout(() => {
        scrollToBottom()
      }, 500)
    }
  }, [initialMessages, messages, setMessages, scrollToBottom])

  useEffect(() => {
    if (isSmartToken && lastDeploymentData && !completedDeploymentReport && status !== "in_progress") {
      const contractAddress = lastDeploymentData.contractAddress
      const chainId = lastDeploymentData.chainId
      append({
        id: threadId,
        role: "system",
        content: `The user has successfully deployed a contract manually here are the details: \n\n Address: ${contractAddress} ChainId: ${chainId}`
      })
      setCompletedDeploymentReport(true)
      scrollToBottom()
    }
  }, [
    threadId,
    status,
    append,
    setCompletedDeploymentReport,
    scrollToBottom,
    lastDeploymentData,
    lastDeploymentData?.chainId,
    lastDeploymentData?.contractAddress,
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

  return (
    <>
      <div ref={chatRef} className={cn("px-4 pb-[200px] pt-4 md:pt-10", className)}>
        {agent ? <AgentCard agent={agent} /> : <Landing userId={userId} />}
        <ChatList messages={messages} avatarUrl={avatarUrl} status={status} />
        <ChatScrollAnchor trackVisibility={status === "in_progress"} />
      </div>
      <ChatPanel setThreadId={setThreadId} stop={stop} append={append} status={status} />
    </>
  )
}
