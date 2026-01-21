import type { UseChatHelpers } from "@ai-sdk/react"
import type { UIMessage } from "ai"
import { ButtonScrollToBottom } from "@/components/chat/button-scroll-to-bottom"
import { PromptForm } from "@/components/chat/prompt-form"
import { IconSpinner } from "@/components/icons"
import { Button } from "@/components/ui/button"

export type ChatPanelProps = {
  append: UseChatHelpers<UIMessage>["sendMessage"]
  stop: UseChatHelpers<UIMessage>["stop"]
  isLoading: boolean
  onNewChat: () => void
  isDeprecated?: boolean
}

export function ChatPanel({ isLoading, append, stop, onNewChat, isDeprecated = false }: ChatPanelProps) {
  return (
    <div className="pointer-events-none fixed right-0 bottom-0 left-0 z-50 p-3 transition-all duration-300 ease-in-out sm:p-4 lg:left-80 lg:[html[data-sidebar-collapsed='true']_&]:left-16">
      <div className="pointer-events-auto mx-auto max-w-4xl">
        <ButtonScrollToBottom />
        <div className="mb-2 flex h-10 items-center justify-center">
          {isLoading ? (
            <Button className="bg-background shadow-md" onClick={() => stop()} variant="outline">
              <IconSpinner className="mr-2 animate-spin" />
              Stop generating
            </Button>
          ) : null}
        </div>
        <div className="rounded-2xl border bg-background/95 px-4 py-3 shadow-xl backdrop-blur-sm">
          <PromptForm append={append} isDeprecated={isDeprecated} isLoading={isLoading} onNewChat={onNewChat} />
        </div>
      </div>
    </div>
  )
}
