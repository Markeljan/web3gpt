"use client"

import type { Message } from "ai"

import { Button } from "@/components/ui/button"
import { IconCheck, IconCopy } from "@/components/ui/icons"
import { useCopyToClipboard } from "@/lib/hooks/use-copy-to-clipboard"
import { cn } from "@/lib/utils"

interface ChatMessageActionsProps extends React.ComponentProps<"div"> {
  message: Message
}

export function ChatMessageActions({ message, className, ...props }: ChatMessageActionsProps) {
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 })

  return (
    <div
      className={cn(
        "md:-right-10 md:-top-2 flex items-center justify-end transition-opacity group-hover:opacity-100 md:absolute md:opacity-0",
        className
      )}
      {...props}
    >
      <Button onClick={() => copyToClipboard(message.content)} size="icon" variant="ghost">
        {isCopied ? <IconCheck /> : <IconCopy />}
        <span className="sr-only">Copy message</span>
      </Button>
    </div>
  )
}
