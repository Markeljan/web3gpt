"use client"

import { type UIMessage, useChat } from "@ai-sdk/react"
import { DefaultChatTransport, generateId } from "ai"
import { usePathname, useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { AgentCard } from "@/components/agent-card"
import { ChatList } from "@/components/chat/chat-list"
import { ChatPanel } from "@/components/chat/chat-panel"
import { ChatScrollAnchor } from "@/components/chat/chat-scroll-anchor"
import { Landing } from "@/components/landing"
import { NewChatButton } from "@/components/new-chat-button"
import { DEFAULT_AGENT, DEFAULT_AGENT_ID } from "@/lib/constants"
import { useScrollToBottom } from "@/lib/hooks/use-scroll-to-bottom"
import type { Agent } from "@/lib/types"
import { cn } from "@/lib/utils"

type ChatProps = {
  agent: Agent
  className?: string
  initialChatId?: string
  initialMessages?: UIMessage[]
  userId?: string
  avatarUrl?: string | null
  isDeprecated?: boolean
}

const SCROLL_TO_BOTTOM_DELAY = 500

export const Chat = ({
  initialChatId,
  initialMessages = [],
  agent,
  className,
  userId,
  avatarUrl,
  isDeprecated = false,
}: ChatProps) => {
  const chatRef = useRef<HTMLDivElement>(null)
  const previousAgentId = useRef<string | undefined>(undefined)
  const lastSyncedMessageCount = useRef(initialMessages.length)
  const { scrollToBottom } = useScrollToBottom(chatRef)
  const [chatId, setChatId] = useState<string | undefined>(initialChatId)
  const router = useRouter()
  const pathname = usePathname()

  // Generate a new chat ID if not provided
  const currentChatId = useMemo(() => chatId || generateId(), [chatId])

  const { messages, status, stop, sendMessage, setMessages, id } = useChat({
    id: currentChatId,
    transport: isDeprecated
      ? undefined
      : new DefaultChatTransport({
          api: "/api/chat",
          body: {
            agentId: agent.id || DEFAULT_AGENT.id,
            chatId: currentChatId,
          },
        }),
    messages: initialMessages,
  })

  const isStreaming = status === "streaming"
  const isInProgress = isStreaming || status === "submitted"
  const showLanding = agent.id === DEFAULT_AGENT_ID && !initialChatId

  const handleNewChat = useCallback(() => {
    setChatId(undefined)
    setMessages([])
    lastSyncedMessageCount.current = 0
  }, [setMessages])

  useEffect(() => {
    if (!isDeprecated && id && !isInProgress && messages.length > 0) {
      const nextPath = `/chat/${id}`
      if (pathname !== nextPath) {
        router.replace(nextPath)
      }
    }
  }, [id, isInProgress, messages.length, isDeprecated, pathname, router])

  useEffect(() => {
    if (isDeprecated || !id || isInProgress || messages.length === 0) {
      return
    }

    if (messages.length <= lastSyncedMessageCount.current) {
      return
    }

    lastSyncedMessageCount.current = messages.length
    router.refresh()
  }, [id, isDeprecated, isInProgress, messages.length, router])

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
      lastSyncedMessageCount.current = 0
    }
    previousAgentId.current = agent.id
  }, [agent.id, setMessages])

  return (
    <>
      <div className={cn("px-3 pt-4 pb-32 sm:px-4 md:pt-10", className)} ref={chatRef}>
        {isDeprecated && (
          <div className="mb-4 rounded-lg border border-yellow-500/50 bg-yellow-500/10 px-4 py-3 text-sm">
            <div className="flex items-start gap-2">
              <span className="font-semibold text-yellow-600 dark:text-yellow-400">⚠️ Deprecated Chat</span>
            </div>
            <p className="mt-1 text-muted-foreground">
              This is an older chat from the previous version of Web3GPT. It is read-only. Start a new chat to continue
              the conversation.
            </p>
          </div>
        )}
        {showLanding ? (
          <Landing userId={userId} />
        ) : (
          <AgentCard agent={agent}>
            <NewChatButton agentId={agent.id} onNewChat={handleNewChat} />
          </AgentCard>
        )}
        <ChatList avatarUrl={avatarUrl} isLoading={isInProgress} isStreaming={isStreaming} messages={messages} />
        <ChatScrollAnchor trackVisibility={isInProgress} />
      </div>
      <ChatPanel
        append={sendMessage}
        isDeprecated={isDeprecated}
        isLoading={isInProgress}
        onNewChat={handleNewChat}
        stop={stop}
      />
    </>
  )
}
