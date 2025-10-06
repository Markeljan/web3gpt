"use client"

import type { UseAssistantHelpers } from "@ai-sdk/react"
import { ArrowUp } from "lucide-react"
import { useRouter } from "next/navigation"
import { type ChangeEvent, useEffect, useRef, useState, useTransition } from "react"
import Textarea from "react-textarea-autosize"
import { Button, buttonVariants } from "@/components/ui/button"
import { IconClose, IconPlus, IconSpinner } from "@/components/ui/icons"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useEnterSubmit } from "@/lib/hooks/use-enter-submit"
import { useScrollToBottom } from "@/lib/hooks/use-scroll-to-bottom"
import { cn } from "@/lib/utils"

const GUILD_PROMPT_STORAGE_KEY = "w3gpt-guild-prompt-seen"

type PromptProps = Pick<UseAssistantHelpers, "append" | "status" | "setThreadId">

export const PromptForm = ({ append, status, setThreadId }: PromptProps) => {
  const [input, setInput] = useState<string>("")
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { formRef, onKeyDown } = useEnterSubmit()
  const { scrollToBottom } = useScrollToBottom()
  const [isPendingTransition, startTransition] = useTransition()
  const router = useRouter()
  const isInProgress = status === "in_progress"
  const [hasSeenGuildPrompt, setHasSeenGuildPrompt] = useState(false)
  const [isGuildPromptReady, setIsGuildPromptReady] = useState(false)
  const [shouldOpenGuildPrompt, setShouldOpenGuildPrompt] = useState(false)
  const [isGuildPromptOpen, setIsGuildPromptOpen] = useState(false)

  const markGuildPromptAsSeen = () => {
    setHasSeenGuildPrompt(true)
    if (typeof window !== "undefined") {
      localStorage.setItem(GUILD_PROMPT_STORAGE_KEY, "true")
    }
  }

  const openGuildPrompt = () => {
    setIsGuildPromptOpen(true)
    setShouldOpenGuildPrompt(false)
    markGuildPromptAsSeen()
  }

  const handleGuildPromptTrigger = () => {
    if (!isGuildPromptReady) {
      setShouldOpenGuildPrompt(true)
      return
    }

    if (hasSeenGuildPrompt) {
      return
    }

    setShouldOpenGuildPrompt(true)
  }

  const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    handleGuildPromptTrigger()
    event.preventDefault()
    setInput(event.target.value)
  }

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const storedValue = localStorage.getItem(GUILD_PROMPT_STORAGE_KEY)
    const hasSeen = storedValue === "true"
    setHasSeenGuildPrompt(hasSeen)
    setIsGuildPromptReady(true)
  }, [])

  useEffect(() => {
    if (!isGuildPromptReady) {
      return
    }

    if (hasSeenGuildPrompt) {
      setShouldOpenGuildPrompt(false)
      return
    }

    if (!shouldOpenGuildPrompt) {
      return
    }

    openGuildPrompt()
  }, [hasSeenGuildPrompt, isGuildPromptReady, shouldOpenGuildPrompt])

  return (
    <>
      {isGuildPromptOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4">
          <div className="relative w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
            <button
              type="button"
              aria-label="Close join guild message"
              className="absolute right-4 top-4 rounded-full border bg-background/80 p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              onClick={() => setIsGuildPromptOpen(false)}
            >
              <IconClose className="size-4" />
            </button>
            <h3 className="text-lg font-semibold">Join the w3gpt Guild</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Become part of the community to unlock special roles and stay eligible for upcoming rewards.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setIsGuildPromptOpen(false)}>
                Maybe later
              </Button>
              <Button asChild>
                <a href="https://guild.xyz/w3gpt" target="_blank" rel="noreferrer" onClick={() => setIsGuildPromptOpen(false)}>
                  Join the Guild
                </a>
              </Button>
            </div>
          </div>
        </div>
      ) : null}
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
            onFocus={handleGuildPromptTrigger}
            onChange={handleInputChange}
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
    </>
  )
}
