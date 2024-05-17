"use client"
import { useEffect } from "react"

import { useAssistant, type Message } from "ai/react"

import { ChatList } from "@/components/chat/chat-list"
import { ChatPanel } from "@/components/chat/chat-panel"
import { ChatScrollAnchor } from "@/components/chat/chat-scroll-anchor"
import { Landing } from "@/components/landing"
import { DEFAULT_AGENT } from "@/lib/constants"
import type { Agent } from "@/lib/types"
import { cn } from "@/lib/utils"
import { AgentCard } from "@/components/agent-card"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

// import { FileViewer } from "@/components/file-viewer"

type ChatProps = {
  className?: string
  agent?: Agent
  threadId?: string
  initialMessages?: Message[]
}

const Chat = ({ threadId, initialMessages, agent, className }: ChatProps) => {
  const session = useSession()
  const avatarUrl = session?.data?.user?.image
  const userId = session?.data?.user?.id
  const router = useRouter()
  const {
    messages,
    status,
    input,
    submitMessage,
    handleInputChange,
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

  const isLoading = status === "in_progress"
  return (
    <>
      <div className={cn("px-4 pb-[200px] pt-4 md:pt-10", className)}>
        {agent ? <AgentCard agent={agent} /> : <Landing />}
        <ChatList isLoading={isLoading} messages={messages} avatarUrl={avatarUrl} />
        <ChatScrollAnchor trackVisibility={isLoading} />
      </div>
      {/* <FileViewer /> */}
      <ChatPanel submitMessage={submitMessage} input={input} handleInputChange={handleInputChange} status={status} />
    </>
  )
}

export default Chat
