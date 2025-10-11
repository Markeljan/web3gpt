import type { UseAssistantHelpers } from "@ai-sdk/react"
import { ButtonScrollToBottom } from "@/components/chat/button-scroll-to-bottom"
import { PromptForm } from "@/components/chat/prompt-form"
import { Button } from "@/components/ui/button"
import { IconSpinner } from "@/components/ui/icons"

export type ChatPanelProps = Pick<UseAssistantHelpers, "status" | "append" | "stop" | "setThreadId">

export function ChatPanel({ status, append, stop, setThreadId }: ChatPanelProps) {
  return (
    <div className="pointer-events-none fixed right-0 bottom-0 left-0 z-50 p-3 transition-all duration-300 ease-in-out sm:p-4 lg:left-80 lg:[html[data-sidebar-collapsed='true']_&]:left-16">
      <div className="pointer-events-auto mx-auto max-w-4xl">
        <ButtonScrollToBottom />
        <div className="mb-2 flex h-10 items-center justify-center">
          {status === "in_progress" ? (
            <Button className="bg-background shadow-md" onClick={() => stop()} variant="outline">
              <IconSpinner className="mr-2 animate-spin" />
              Stop generating
            </Button>
          ) : null}
        </div>
        <div className="rounded-2xl border bg-background/95 px-4 py-3 shadow-xl backdrop-blur-sm">
          <PromptForm append={append} setThreadId={setThreadId} status={status} />
        </div>
      </div>
    </div>
  )
}
