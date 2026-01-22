import type { UIMessage } from "ai"
import Image from "next/image"
import type { Components } from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import { Reasoning, ReasoningContent, ReasoningTrigger } from "@/components/ai-elements/reasoning"
import { ChatMessageActions } from "@/components/chat/chat-message-actions"
import { CodeBlock } from "@/components/code-block"
import { IconUser, IconWeb3GPT } from "@/components/icons"
import { MemoizedReactMarkdown } from "@/components/markdown"
import type { LegacyMessage } from "@/lib/types"

export type ChatMessageProps = {
  message: UIMessage | LegacyMessage
  isLoading?: boolean
  isStreaming?: boolean
  isLastMessage?: boolean
  avatarUrl?: string | null
}

type MessageParts = UIMessage["parts"]
type MessagePart = MessageParts[number]

const LANGUAGE_REGEX = /language-(\w+)/
const NEWLINE_REGEX = /\n$/

// Helper to check if a part is a tool invocation (starts with "tool-" or is "dynamic-tool")
function isToolPart(part: MessagePart): boolean {
  return part.type.startsWith("tool-") || part.type === "dynamic-tool"
}

// Helper to get tool name from a tool part
function getToolNameFromPart(part: MessagePart): string {
  if (part.type === "dynamic-tool" && "toolName" in part) {
    return String(part.toolName)
  }
  if (part.type.startsWith("tool-")) {
    return part.type.replace("tool-", "")
  }
  return "unknown"
}

// Tool state icon and class mapping
function getToolDisplay(state: string | undefined): { icon: string; className: string; isRunning: boolean } {
  const runningStates = ["input-streaming", "input-available", "approval-requested"]
  const completeStates = ["output-available", "approval-responded"]
  const errorStates = ["output-error", "output-denied"]

  if (state && runningStates.includes(state)) {
    return { icon: "⏳", className: "animate-pulse", isRunning: true }
  }
  if (state && completeStates.includes(state)) {
    return { icon: "✓", className: "text-green-500", isRunning: false }
  }
  if (state && errorStates.includes(state)) {
    return { icon: "✗", className: "text-red-500", isRunning: false }
  }
  return { icon: "○", className: "", isRunning: false }
}

// Component for rendering tool invocation parts
function ToolInvocationPart({ part }: { part: MessagePart }) {
  const toolName = getToolNameFromPart(part)
  const toolState = "state" in part ? (part.state as string | undefined) : undefined
  const { icon, className, isRunning } = getToolDisplay(toolState)

  return (
    <div className="my-2 flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2 text-muted-foreground text-sm">
      <span className={className}>{icon}</span>
      <span className="font-medium">{toolName}</span>
      {isRunning && <span className="text-xs">Running...</span>}
    </div>
  )
}

// Helper function to extract parts from both v4 (content) and v5 (parts) message formats
function getMessageParts(message: UIMessage | LegacyMessage): MessageParts {
  // Handle v5 format (parts array)
  const parts = "parts" in message ? message.parts : undefined
  if (parts && Array.isArray(parts) && parts.length > 0) {
    return parts as MessageParts
  }

  // Handle v4 format (content property) for backward compatibility
  if ("content" in message && message.content) {
    const content = message.content
    if (typeof content === "string") {
      return [{ type: "text", text: content }]
    }
    if (Array.isArray(content)) {
      return content as MessageParts
    }
  }

  return []
}

export function ChatMessage({
  message,
  avatarUrl,
  isLoading,
  isStreaming = false,
  isLastMessage = false,
}: ChatMessageProps) {
  // Extract parts from message - handle both v4 (content) and v5 (parts) formats
  const messageParts = getMessageParts(message)

  const components: Components = {
    p({ children }) {
      return <p className="mb-2 last:mb-0">{children}</p>
    },
    a({ href, children }) {
      return (
        <a href={href} rel="noopener noreferrer" target="_blank">
          {children}
        </a>
      )
    },
    code({ className, children, ...props }) {
      const childArray = Array.isArray(children) ? children : [children]

      if (typeof childArray?.[0] === "string" && childArray[0] === "▍") {
        return <span className="mt-1 animate-pulse cursor-default">▍</span>
      }

      // Check if this is an inline code block (no language class and short content)
      const match = LANGUAGE_REGEX.exec(className || "")
      const isInline = !(match || className?.includes("language-"))

      if (isInline) {
        return (
          <code className={className} {...props}>
            {children}
          </code>
        )
      }

      return (
        <CodeBlock key={message.id} language={match?.[1] || ""} value={String(children).replace(NEWLINE_REGEX, "")} />
      )
    },
  }

  const renderAvatar = () => {
    if (message.role === "user") {
      if (avatarUrl) {
        return <Image alt={"user avatar"} className="rounded-md" fill={true} sizes="32px" src={avatarUrl} />
      }
      return <IconUser />
    }
    return <IconWeb3GPT />
  }

  const renderMessageParts = () => {
    return messageParts.map((part, index) => {
      const isLastPart = index === messageParts.length - 1
      // Use the part's state property if available, otherwise fall back to message-level streaming check
      const partState = "state" in part ? part.state : undefined
      const isPartStreaming = partState === "streaming" || (isStreaming && isLastMessage && isLastPart && !partState)

      // Handle reasoning parts
      if (part.type === "reasoning") {
        return (
          <Reasoning isStreaming={isPartStreaming} key={`${message.id}-reasoning-${index}`}>
            <ReasoningTrigger />
            <ReasoningContent>{part.text || ""}</ReasoningContent>
          </Reasoning>
        )
      }

      // Handle text parts
      if (part.type === "text") {
        return (
          <MemoizedReactMarkdown
            className="prose dark:prose-invert flex max-w-full flex-col break-words prose-pre:p-0 prose-p:leading-relaxed"
            components={components}
            key={`${message.id}-text-${index}`}
            remarkPlugins={[remarkGfm, remarkMath]}
          >
            {part.text || ""}
          </MemoizedReactMarkdown>
        )
      }

      // Handle tool invocation parts (tool-* and dynamic-tool)
      if (isToolPart(part)) {
        return <ToolInvocationPart key={`${message.id}-tool-${index}`} part={part} />
      }

      // Handle source URL parts
      if (part.type === "source-url") {
        return (
          <a
            className="my-1 inline-flex items-center gap-1 text-blue-500 text-xs hover:underline"
            href={part.url}
            key={`${message.id}-source-${index}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            [{part.sourceId}] {part.title || part.url}
          </a>
        )
      }

      // DISABLED: Handle step-start parts (visual separator for multi-step responses)
      if (part.type === "step-start") {
        // return <div className="my-2 border-muted border-t border-dashed" key={`${message.id}-step-${index}`} />
        return null
      }

      // Ignore other part types (file, source-document, data-*, etc.)
      return null
    })
  }

  return (
    <div className="group relative mb-4 flex w-full items-start md:-ml-12">
      <div className="relative flex size-8 shrink-0 select-none items-center justify-center overflow-hidden rounded-md border shadow">
        {renderAvatar()}
      </div>
      <div className="ml-1 flex-1 space-y-2 overflow-x-auto md:ml-4">
        {renderMessageParts()}
        {isLoading ? null : <ChatMessageActions message={message} />}
      </div>
    </div>
  )
}
