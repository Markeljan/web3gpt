import type { UseAssistantHelpers } from "@ai-sdk/react"
import { ArrowUp } from "lucide-react"
import { useRouter } from "next/navigation"
import { type ChangeEvent, useCallback, useEffect, useRef, useState, useTransition } from "react"
import Textarea from "react-textarea-autosize"
import { Button, buttonVariants } from "@/components/ui/button"
import { IconClose, IconPlus, IconSpinner } from "@/components/ui/icons"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useEnterSubmit } from "@/lib/hooks/use-enter-submit"
import { useLocalStorage } from "@/lib/hooks/use-local-storage"
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
  const [hasSeenGuildPrompt, setHasSeenGuildPrompt] = useLocalStorage(GUILD_PROMPT_STORAGE_KEY, false)
  const [isGuildPromptReady, setIsGuildPromptReady] = useState(false)
  const [shouldOpenGuildPrompt, setShouldOpenGuildPrompt] = useState(false)
  const [isGuildPromptOpen, setIsGuildPromptOpen] = useState(false)

  const markGuildPromptAsSeen = useCallback(() => {
    setHasSeenGuildPrompt(true)
  }, [setHasSeenGuildPrompt])

  const openGuildPrompt = useCallback(() => {
    setIsGuildPromptOpen(true)
    setShouldOpenGuildPrompt(false)
    markGuildPromptAsSeen()
  }, [markGuildPromptAsSeen])

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
  }, [hasSeenGuildPrompt, isGuildPromptReady, shouldOpenGuildPrompt, openGuildPrompt])

  return (
    <>
      {isGuildPromptOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm">
          <div className="relative mb-24 w-full max-w-md rounded-lg border bg-background p-6 shadow-lg max-sm:mb-8">
            <button
              aria-label="Close join guild message"
              className="absolute top-4 right-4 rounded-full border bg-background/80 p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              onClick={() => setIsGuildPromptOpen(false)}
              type="button"
            >
              <IconClose className="size-4" />
            </button>
            <h3 className="font-semibold text-lg">Join the w3gpt Guild</h3>
            <p className="mt-2 text-muted-foreground text-sm">
              Become part of the community to unlock special roles and stay eligible for upcoming rewards.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button onClick={() => setIsGuildPromptOpen(false)} type="button" variant="ghost">
                Maybe later
              </Button>
              <Button asChild>
                <a
                  href="https://guild.xyz/w3gpt"
                  onClick={() => setIsGuildPromptOpen(false)}
                  rel="noreferrer"
                  target="_blank"
                >
                  Join the Guild
                </a>
              </Button>
            </div>
          </div>
        </div>
      ) : null}
      <form
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
        ref={formRef}
      >
        <div className="relative flex w-full grow flex-col overflow-hidden px-4 sm:px-6">
          <Tooltip delayDuration={500}>
            <TooltipTrigger asChild>
              <Button
                className={cn(
                  buttonVariants({ size: "sm", variant: "secondary" }),
                  "absolute top-4 left-0 size-8 rounded-full border p-0 hover:bg-secondary/80 sm:left-2"
                )}
                disabled={isPendingTransition || isInProgress}
                onClick={() => {
                  startTransition(() => {
                    setThreadId(undefined)
                    router.push("/")
                  })
                }}
                type="submit"
              >
                {isPendingTransition ? <IconSpinner /> : <IconPlus />}
                <span className="sr-only">New Chat</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>New Chat</TooltipContent>
          </Tooltip>
          <Textarea
            autoComplete="off"
            autoCorrect="off"
            autoFocus
            className="max-h-[200px] min-h-[60px] w-full resize-none overflow-y-auto bg-transparent px-8 py-[1.3rem] focus-within:outline-none sm:text-sm md:min-h-[72px] md:py-[1.5rem]"
            onChange={handleInputChange}
            onFocus={handleGuildPromptTrigger}
            onKeyDown={onKeyDown}
            placeholder="send a message"
            ref={inputRef}
            rows={1}
            spellCheck={false}
            tabIndex={0}
            value={input}
          />
          <div className="absolute top-4 right-0 sm:right-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button disabled={input === "" || isInProgress} size="icon" type="submit">
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
