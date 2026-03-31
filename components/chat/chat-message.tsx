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
import { normalizeCodeLanguage } from "@/lib/code-language"
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

const LANGUAGE_REGEX = /language-([a-z0-9#+-]+)/i
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
  const reasoningSessions: Array<{ key: string; text: string; isStreaming: boolean }> = []
  const renderItems: Array<
    | { type: "text"; key: string; text: string }
    | { type: "tool"; key: string; part: MessagePart }
    | { type: "source-url"; key: string; part: MessagePart }
  > = []

  let textBuffer = ""
  let textStartIndex: number | null = null

  const flushTextBuffer = () => {
    if (!textBuffer) {
      return
    }

    renderItems.push({
      type: "text",
      key: `${message.id}-text-${textStartIndex ?? renderItems.length}`,
      text: textBuffer,
    })
    textBuffer = ""
    textStartIndex = null
  }

  for (const [index, part] of messageParts.entries()) {
    const isLastPart = index === messageParts.length - 1
    const partState = "state" in part ? part.state : undefined
    const isPartStreaming = partState === "streaming" || (isStreaming && isLastMessage && isLastPart && !partState)

    if (part.type === "reasoning") {
      reasoningSessions.push({
        key: `${message.id}-reasoning-session-${index}`,
        text: part.text || "",
        isStreaming: isPartStreaming,
      })
      continue
    }

    if (part.type === "step-start") {
      continue
    }

    if (part.type === "text") {
      textStartIndex ??= index
      textBuffer += part.text || ""
      continue
    }

    flushTextBuffer()

    if (isToolPart(part)) {
      renderItems.push({
        type: "tool",
        key: `${message.id}-tool-${index}`,
        part,
      })
      continue
    }

    if (part.type === "source-url") {
      renderItems.push({
        type: "source-url",
        key: `${message.id}-source-${index}`,
        part,
      })
    }
  }

  flushTextBuffer()

  const groupedReasoningText = reasoningSessions
    .map((session, index) => {
      const text = session.text.trim()
      if (!text) {
        return null
      }

      if (reasoningSessions.length === 1) {
        return text
      }

      return `#### Thinking session ${index + 1}\n\n${text}`
    })
    .filter(Boolean)
    .join("\n\n---\n\n")

  const hasReasoning = reasoningSessions.length > 0
  const isReasoningStreaming = reasoningSessions.some((session) => session.isStreaming)

  const components: Components = {
    p({ children }) {
      return <p className="mb-2 last:mb-0">{children}</p>
    },
    pre({ children }) {
      return <>{children}</>
    },
    a({ href, children }) {
      return (
        <a href={href} rel="noopener noreferrer" target="_blank">
          {children}
        </a>
      )
    },
    code({ className, children, node: _node, ...props }) {
      const childArray = Array.isArray(children) ? children : [children]
      const code = childArray.map((child) => (typeof child === "string" ? child : "")).join("")
      const inlineFromProps = "inline" in props && Boolean((props as { inline?: boolean }).inline)
      const hasLanguageClass = Boolean(LANGUAGE_REGEX.exec(className || "") || className?.includes("language-"))
      const hasBlockShape = code.includes("\n")
      const isInline = inlineFromProps || !(hasLanguageClass || hasBlockShape)

      if (code === "▍") {
        return <span className="mt-1 animate-pulse cursor-default">▍</span>
      }

      const match = LANGUAGE_REGEX.exec(className || "")
      const normalizedLanguage = normalizeCodeLanguage(match?.[1], code, {
        inferFromContent: !isInline,
      })

      if (isInline) {
        return (
          <code className={className} {...props}>
            {children}
          </code>
        )
      }

      return <CodeBlock key={message.id} language={normalizedLanguage} value={code.replace(NEWLINE_REGEX, "")} />
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
    return renderItems.map((item) => {
      if (item.type === "text") {
        return (
          <MemoizedReactMarkdown
            className="prose dark:prose-invert flex max-w-full flex-col break-words prose-pre:p-0 prose-p:leading-relaxed"
            components={components}
            key={item.key}
            remarkPlugins={[remarkGfm, remarkMath]}
          >
            {item.text}
          </MemoizedReactMarkdown>
        )
      }

      if (item.type === "tool") {
        return <ToolInvocationPart key={item.key} part={item.part} />
      }

      if (item.type === "source-url" && item.part.type === "source-url") {
        return (
          <a
            className="my-1 inline-flex items-center gap-1 text-blue-500 text-xs hover:underline"
            href={item.part.url}
            key={item.key}
            rel="noopener noreferrer"
            target="_blank"
          >
            [{item.part.sourceId}] {item.part.title || item.part.url}
          </a>
        )
      }

      return null
    })
  }

  return (
    <div className="group relative mb-4 flex w-full items-start md:-ml-12">
      <div className="relative flex size-8 shrink-0 select-none items-center justify-center overflow-hidden rounded-md border shadow">
        {renderAvatar()}
      </div>
      <div className="ml-1 flex-1 space-y-2 overflow-x-auto md:ml-4">
        {hasReasoning ? (
          <Reasoning isStreaming={isReasoningStreaming} key={`${message.id}-reasoning`}>
            <ReasoningTrigger />
            <ReasoningContent>{groupedReasoningText}</ReasoningContent>
          </Reasoning>
        ) : null}
        {renderMessageParts()}
        {isLoading ? null : <ChatMessageActions message={message} />}
      </div>
    </div>
  )
}
