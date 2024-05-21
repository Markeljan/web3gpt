"use client"

import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"

import type { UseAssistantHelpers } from "ai/react"
import Textarea from "react-textarea-autosize"

import { Button, buttonVariants } from "@/components/ui/button"
import { IconArrowElbow, IconHome } from "@/components/ui/icons"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useEnterSubmit } from "@/lib/hooks/use-enter-submit"
import { cn } from "@/lib/utils"

export type PromptProps = Pick<UseAssistantHelpers, "submitMessage" | "input" | "setInput" | "status">

export function PromptForm({ submitMessage, input, setInput, status }: PromptProps) {
  const router = useRouter()
  const { formRef, onKeyDown } = useEnterSubmit()
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        if (!input?.trim() || status === "in_progress") {
          return
        }
        await submitMessage(e)
      }}
      ref={formRef}
    >
      <div className="relative flex w-full grow flex-col overflow-hidden px-8 sm:rounded-md sm:border sm:px-12">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              onClick={() => {
                router.push("/")
              }}
              className={cn(
                buttonVariants({ size: "sm", variant: "secondary" }),
                "absolute left-0 top-4 size-8 rounded-full border p-0 sm:left-4"
              )}
            >
              <IconHome />
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
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="send a message"
          spellCheck={false}
          className="min-h-[60px] w-full resize-none bg-transparent px-4 py-[1.3rem] focus-within:outline-none sm:text-sm"
        />
        <div className="absolute right-0 top-4 sm:right-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="submit" size="icon" disabled={status === "in_progress" || !input?.trim()}>
                <IconArrowElbow className="fill-white" />
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
