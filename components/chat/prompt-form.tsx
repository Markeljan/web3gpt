import { useRouter } from "next/navigation"
import { useEffect, useRef, useState, useTransition } from "react"

import type { UseAssistantHelpers } from "@ai-sdk/react"
import Textarea from "react-textarea-autosize"

import { Button, buttonVariants } from "@/components/ui/button"
import { IconPlus, IconSpinner } from "@/components/ui/icons"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useEnterSubmit } from "@/lib/hooks/use-enter-submit"
import { useScrollToBottom } from "@/lib/hooks/use-scroll-to-bottom"
import { cn } from "@/lib/utils"
import { ArrowUp } from "lucide-react"

type PromptProps = Pick<UseAssistantHelpers, "append" | "status" | "setThreadId">

export const PromptForm = ({ append, status, setThreadId }: PromptProps) => {
  const [input, setInput] = useState<string>("")
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { formRef, onKeyDown } = useEnterSubmit()
  const { scrollToBottom } = useScrollToBottom()
  const [isPendingTransition, startTransition] = useTransition()
  const router = useRouter()
  const isInProgress = status === "in_progress"

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  return (
    <form
      ref={formRef}
      onSubmit={async (e) => {
        e.preventDefault()

        if (isInProgress) {
          return
        }

        const value = input.trim()
        if (!value) {
          return
        }

        setInput("")
        scrollToBottom()
        await append({ role: "user", content: value })
      }}
    >
      <div className="relative flex w-full grow flex-col overflow-hidden px-4 sm:px-6">
        <Tooltip delayDuration={500}>
          <TooltipTrigger asChild>
            <Button
              type="submit"
              disabled={isPendingTransition || isInProgress}
              onClick={() => {
                startTransition(() => {
                  setThreadId(undefined)
                  router.push("/")
                })
              }}
              className={cn(
                buttonVariants({ size: "sm", variant: "secondary" }),
                "absolute left-0 top-4 size-8 rounded-full border p-0 sm:left-2 hover:bg-secondary/80",
              )}
            >
              {isPendingTransition ? <IconSpinner /> : <IconPlus />}
              <span className="sr-only">New Chat</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>New Chat</TooltipContent>
        </Tooltip>
        <Textarea
          ref={inputRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          rows={1}
          autoFocus
          value={input}
          onChange={(e) => {
            e.preventDefault()
            setInput(e.target.value)
          }}
          placeholder="send a message"
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          className="min-h-[60px] md:min-h-[72px] max-h-[200px] w-full resize-none bg-transparent px-8 py-[1.3rem] md:py-[1.5rem] focus-within:outline-none sm:text-sm overflow-y-auto"
        />
        <div className="absolute right-0 top-4 sm:right-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="submit" size="icon" disabled={input === "" || isInProgress}>
                <ArrowUp className="size-5" />
                <span className="sr-only">Send message</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Send message</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </form>
  )
}
