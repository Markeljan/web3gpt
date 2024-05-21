"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { useAssistant, type Message } from "ai/react"
import type { Session } from "next-auth"

import { ChatList } from "@/components/chat/chat-list"
import { ChatPanel } from "@/components/chat/chat-panel"
import { ChatScrollAnchor } from "@/components/chat/chat-scroll-anchor"
import { Landing } from "@/components/landing"
import { DEFAULT_AGENT } from "@/app/config"
import type { Agent } from "@/lib/types"
import { cn } from "@/lib/utils"
import { AgentCard } from "@/components/agent-card"

type ChatProps = {
  className?: string
  agent?: Agent | null
  threadId?: string
  initialMessages?: Message[]
  session?: Session | null
}

export const Chat = ({ threadId, initialMessages, agent, className, session }: ChatProps) => {
  const avatarUrl = session?.user?.image
  const userId = session?.user?.id
  const router = useRouter()
  const {
    messages,
    status,
    input,
    submitMessage,
    setInput,
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
    if (messages && !(messages?.length > 0) && initialMessages) {
      setMessages(initialMessages)
    }
  }, [setMessages, initialMessages, messages])

  useEffect(() => {
    if (userId && threadIdFromAi && threadIdFromAi !== threadId && status !== "in_progress") {
      router.replace(`/chat/${threadIdFromAi}`)
    }
  }, [threadIdFromAi, threadId, router, status, userId])

  return (
    <>
      <div className={cn("px-4 pb-[200px] pt-4 md:pt-10", className)}>
        {agent ? <AgentCard agent={agent} /> : <Landing userId={userId} />}
        <ChatList isLoading={status === "in_progress"} messages={messages} avatarUrl={avatarUrl} />
        <ChatScrollAnchor trackVisibility={status === "in_progress"} />
      </div>
      <ChatPanel submitMessage={submitMessage} input={input} setInput={setInput} status={status} />
    </>
  )
}
