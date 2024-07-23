"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { useAssistant, type Message } from "@ai-sdk/react"
import type { Session } from "next-auth"

import { ChatList } from "@/components/chat/chat-list"
import { ChatPanel } from "@/components/chat/chat-panel"
import { ChatScrollAnchor } from "@/components/chat/chat-scroll-anchor"
import { Landing } from "@/components/landing"
import { DEFAULT_AGENT } from "@/lib/config"
import type { Agent } from "@/lib/types"
import { cn } from "@/lib/utils"
import { AgentCard } from "@/components/agent-card"

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

  return (
    <>
      <div className={cn("px-4 pb-[200px] pt-4 md:pt-10", className)}>
        {agent ? <AgentCard agent={agent} /> : <Landing userId={userId} />}
        <ChatList messages={messages} avatarUrl={avatarUrl} status={status} />
        <ChatScrollAnchor trackVisibility={status === "in_progress"} />
      </div>
      <ChatPanel stop={stop} append={append} status={status} />
    </>
  )
}
