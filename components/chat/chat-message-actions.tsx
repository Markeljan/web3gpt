"use client"

import type { UIMessage } from "ai"
import { IconCheck, IconCopy } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { useCopyToClipboard } from "@/lib/hooks/use-copy-to-clipboard"
import type { LegacyMessage } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ChatMessageActionsProps extends React.ComponentProps<"div"> {
  message: UIMessage | LegacyMessage
}

// Helper function to extract text content from both v4 and v5 message formats
function getMessageText(message: UIMessage | LegacyMessage): string {
  // Handle v5 format (parts array)
  const parts = "parts" in message ? message.parts : undefined
  if (parts && Array.isArray(parts) && parts.length > 0) {
    return parts
      .filter((part) => part.type === "text" && "text" in part)
      .map((part) => ("text" in part ? part.text : ""))
      .join("")
  }

  // Handle v4 format (content property) for backward compatibility
  if ("content" in message && message.content) {
    const content = message.content
    if (typeof content === "string") {
      return content
    }
    if (Array.isArray(content)) {
      return (content as Array<{ type?: string; text?: string }>)
        .filter((part) => part.type === "text" && typeof part.text === "string")
        .map((part) => part.text || "")
        .join("")
    }
  }

  return ""
}

export function ChatMessageActions({ message, className, ...props }: ChatMessageActionsProps) {
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 })
  const messageText = getMessageText(message)

  return (
    <div
      className={cn(
        "flex items-center justify-end transition-opacity group-hover:opacity-100 md:absolute md:-top-2 md:-right-10 md:opacity-0",
        className
      )}
      {...props}
    >
      <Button onClick={() => copyToClipboard(messageText)} size="icon" variant="ghost">
        {isCopied ? <IconCheck /> : <IconCopy />}
        <span className="sr-only">Copy message</span>
      </Button>
    </div>
  )
}
