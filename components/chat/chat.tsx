"use client"

import { type CreateMessage, type Message, useAssistant } from "@ai-sdk/react"
import { generateId } from "ai"
import { useCallback, useEffect, useRef } from "react"

import { useGlobalStore } from "@/app/state/global-store"
import { AgentCard } from "@/components/agent-card"
import { ChatList } from "@/components/chat/chat-list"
import { ChatPanel } from "@/components/chat/chat-panel"
import { ChatScrollAnchor } from "@/components/chat/chat-scroll-anchor"
import { Landing } from "@/components/landing"
import { DEFAULT_AGENT, DEFAULT_AGENT_ID, TOKENSCRIPT_AGENT_ID } from "@/lib/constants"
import { useScrollToBottom } from "@/lib/hooks/use-scroll-to-bottom"
import type { Agent } from "@/lib/types"
import { cn } from "@/lib/utils"

type ChatProps = {
  agent: Agent
  className?: string
  initialThreadId?: string
  initialMessages?: Message[]
  userId?: string
  avatarUrl?: string | null
}

export const Chat = ({ initialThreadId, initialMessages = [], agent, className, userId, avatarUrl }: ChatProps) => {
  const chatRef = useRef<HTMLDivElement>(null)
  const { scrollToBottom } = useScrollToBottom(chatRef)

  const {
    tokenScriptViewerUrl,
    lastDeploymentData,
    completedDeploymentReport,
    setCompletedDeploymentReport,
    setTokenScriptViewerUrl,
  } = useGlobalStore()
  const { messages, status, setThreadId, stop, append, setMessages, threadId } = useAssistant({
    threadId: initialThreadId,
    api: "/api/assistants/threads/messages",
    body: {
      assistantId: agent.id || DEFAULT_AGENT.id,
    },
  })

  const isInProgress = status === "in_progress"
  const isTokenScriptAgent = agent.id === TOKENSCRIPT_AGENT_ID
  const showLanding = agent.id === DEFAULT_AGENT_ID && !initialThreadId

  const appendSystemMessage = useCallback(
    (message: Message | CreateMessage) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          ...message,
          id: message.id || generateId(),
        },
      ])
    },
    [setMessages],
  )

  useEffect(() => {
    if (threadId && !isInProgress && initialThreadId !== threadId) {
      history.pushState(null, "", `/chat/${threadId}`)
    }
  }, [initialThreadId, isInProgress, threadId])

  useEffect(() => {
    if (messages.length === 0 && initialMessages?.length > 0) {
      setMessages(initialMessages)
      setTimeout(() => {
        scrollToBottom()
      }, 500)
    }
  }, [initialMessages, messages, setMessages, scrollToBottom])

  useEffect(() => {
    if (isTokenScriptAgent && lastDeploymentData && !completedDeploymentReport && !isInProgress) {
      const { ipfsUrl, explorerUrl, contractAddress, transactionHash, walletAddress, chainId } = lastDeploymentData
      appendSystemMessage({
        role: "system",
        content: `User deployed the following TokenScript contract:
        ${JSON.stringify({
          ipfsUrl,
          explorerUrl,
          contractAddress,
          transactionHash,
          walletAddress,
          chainId,
        })}`,
      })
      setCompletedDeploymentReport(true)
      scrollToBottom()
    }
  }, [
    appendSystemMessage,
    setCompletedDeploymentReport,
    scrollToBottom,
    lastDeploymentData,
    isTokenScriptAgent,
    completedDeploymentReport,
    isInProgress,
  ])

  useEffect(() => {
    if (tokenScriptViewerUrl && completedDeploymentReport && !isInProgress) {
      appendSystemMessage({
        role: "system",
        content: `User uploaded the TokenScript and updated the scriptURI:
        ${JSON.stringify(tokenScriptViewerUrl)}`,
      })
      setTokenScriptViewerUrl(null)
    }
  }, [appendSystemMessage, isInProgress, tokenScriptViewerUrl, completedDeploymentReport, setTokenScriptViewerUrl])

  return (
    <>
      <div ref={chatRef} className={cn("px-3 pb-32 pt-4 sm:px-4 md:pt-10", className)}>
        {showLanding ? <Landing userId={userId} /> : <AgentCard setThreadId={setThreadId} agent={agent} />}
        <ChatList messages={messages} avatarUrl={avatarUrl} status={status} />
        <ChatScrollAnchor trackVisibility={isInProgress} />
      </div>
      <ChatPanel setThreadId={setThreadId} stop={stop} append={append} status={status} />
    </>
  )
}
