"use client"

import { type Message, useChat } from "@ai-sdk/react"
import { generateId } from "ai"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

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
  initialChatId?: string
  initialMessages?: Message[]
  userId?: string
  avatarUrl?: string | null
}

const SCROLL_TO_BOTTOM_DELAY = 500

export const Chat = ({ initialChatId, initialMessages = [], agent, className, userId, avatarUrl }: ChatProps) => {
  const chatRef = useRef<HTMLDivElement>(null)
  const previousAgentId = useRef<string | undefined>(undefined)
  const router = useRouter()
  const { scrollToBottom } = useScrollToBottom(chatRef)
  const [chatId, setChatId] = useState<string | undefined>(initialChatId)

  // Generate a new chat ID if not provided
  const currentChatId = useMemo(() => chatId || generateId(), [chatId])

  const {
    tokenScriptViewerUrl,
    lastDeploymentData,
    completedDeploymentReport,
    setCompletedDeploymentReport,
    setTokenScriptViewerUrl,
  } = useGlobalStore()

  const { messages, isLoading, stop, append, setMessages, id } = useChat({
    id: currentChatId,
    api: "/api/chat",
    body: {
      agentId: agent.id || DEFAULT_AGENT.id,
      chatId: currentChatId,
    },
    initialMessages,
  })

  const isInProgress = isLoading
  const isTokenScriptAgent = agent.id === TOKENSCRIPT_AGENT_ID
  const showLanding = agent.id === DEFAULT_AGENT_ID && !initialChatId

  const appendSystemMessage = useCallback(
    (message: Message | Omit<Message, "id">) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          ...message,
          id: "id" in message ? message.id : generateId(),
        } as Message,
      ])
    },
    [setMessages]
  )

  const handleNewChat = useCallback(() => {
    setChatId(undefined)
    setMessages([])
    router.push("/")
  }, [setMessages, router])

  useEffect(() => {
    if (id && !isInProgress && initialChatId !== id && messages.length > 0) {
      history.pushState(null, "", `/chat/${id}`)
    }
  }, [initialChatId, isInProgress, id, messages.length])

  useEffect(() => {
    if (messages.length === 0 && initialMessages?.length > 0) {
      setMessages(initialMessages)
      setTimeout(() => {
        scrollToBottom()
      }, SCROLL_TO_BOTTOM_DELAY)
    }
  }, [initialMessages, messages, setMessages, scrollToBottom])

  // Clear messages when agent changes
  useEffect(() => {
    if (previousAgentId.current && previousAgentId.current !== agent.id) {
      setMessages([])
      setChatId(undefined)
    }
    previousAgentId.current = agent.id
  }, [agent.id, setMessages])

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
      <div className={cn("px-3 pt-4 pb-32 sm:px-4 md:pt-10", className)} ref={chatRef}>
        {showLanding ? (
          <Landing userId={userId} />
        ) : (
          <AgentCard agent={agent} onNewChat={handleNewChat} setMessages={setMessages} />
        )}
        <ChatList avatarUrl={avatarUrl} isLoading={isLoading} messages={messages} />
        <ChatScrollAnchor trackVisibility={isInProgress} />
      </div>
      <ChatPanel append={append} isLoading={isLoading} onNewChat={handleNewChat} stop={stop} />
    </>
  )
}
