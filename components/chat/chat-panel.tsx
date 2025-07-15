import type { UseAssistantHelpers } from "@ai-sdk/react"
import { ButtonScrollToBottom } from "@/components/chat/button-scroll-to-bottom"
import { PromptForm } from "@/components/chat/prompt-form"
import { Button } from "@/components/ui/button"
import { IconSpinner } from "@/components/ui/icons"

export type ChatPanelProps = Pick<UseAssistantHelpers, "status" | "append" | "stop" | "setThreadId">

export function ChatPanel({ status, append, stop, setThreadId }: ChatPanelProps) {
  return (
    <div className="fixed bottom-0 left-0 lg:left-80 lg:[html[data-sidebar-collapsed='true']_&]:left-16 right-0 p-3 sm:p-4 z-50 pointer-events-none transition-all duration-300 ease-in-out">
      <div className="max-w-4xl mx-auto pointer-events-auto">
        <ButtonScrollToBottom />
        <div className="flex h-10 items-center justify-center mb-2">
          {status === "in_progress" ? (
            <Button variant="outline" onClick={() => stop()} className="bg-background shadow-md">
              <IconSpinner className="mr-2 animate-spin" />
              Stop generating
            </Button>
          ) : null}
        </div>
        <div className="rounded-2xl border shadow-xl px-4 py-3 backdrop-blur-sm bg-background/95">
          <PromptForm setThreadId={setThreadId} append={append} status={status} />
        </div>
      </div>
    </div>
  )
}
