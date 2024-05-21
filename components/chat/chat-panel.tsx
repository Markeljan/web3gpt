import type { UseAssistantHelpers } from "ai/react"

import { ButtonScrollToBottom } from "@/components/chat/button-scroll-to-bottom"
import { PromptForm } from "@/components/chat/prompt-form"
import { Button } from "@/components/ui/button"
import { IconSpinner } from "@/components/ui/icons"

export type ChatPanelProps = Pick<UseAssistantHelpers, "status" | "submitMessage" | "input" | "setInput">

export function ChatPanel({ status, submitMessage, input, setInput }: ChatPanelProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 bg-gradient-to-b from-muted/0 from-0% to-muted/30 to-50%">
      <ButtonScrollToBottom />
      <div className="mx-auto sm:max-w-2xl sm:px-4">
        <div className="flex h-10 items-center justify-center">
          {status === "in_progress" ? (
            <Button variant="outline" onClick={() => stop()} className="bg-background">
              <IconSpinner className="mr-2 animate-spin" />
              Stop generating
            </Button>
          ) : null}
        </div>
        <div className="space-y-4 border-t bg-background px-4 py-2 shadow-lg sm:rounded-t-xl sm:border md:py-4">
          <PromptForm
            submitMessage={submitMessage}
            input={input}
            setInput={setInput}
            status={status}
          />
        </div>
      </div>
    </div>
  )
}
