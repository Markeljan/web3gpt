"use client"

import { createContext, useContext } from "react"

type ChatScrollContextValue = {
  isAtBottom: boolean
  scrollToBottom: (behavior?: ScrollBehavior) => void
}

const ChatScrollContext = createContext<ChatScrollContextValue>({
  isAtBottom: true,
  scrollToBottom: () => {
    // no-op outside a chat scroll container
  },
})

export const ChatScrollProvider = ChatScrollContext.Provider

export function useChatScroll() {
  return useContext(ChatScrollContext)
}
