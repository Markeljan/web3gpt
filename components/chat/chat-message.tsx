import type { UIMessage } from "ai"
import Image from "next/image"
import { Fragment, type ReactNode } from "react"
import type { Components } from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtStep,
} from "@/components/ai-elements/chain-of-thought"
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
type ReasoningPart = Extract<MessagePart, { type: "reasoning" }>

const LANGUAGE_REGEX = /language-([a-z0-9#+-]+)/i
const NEWLINE_REGEX = /\n$/
const REASONING_SPLIT_REGEX = /\n{2,}/
const REASONING_HEADING_REGEX = /^#{1,6}\s*/

function splitReasoningText(text: string): { title: string; details: string } {
  const normalized = text.trim()

  if (!normalized) {
    return { title: "Thinking", details: "" }
  }

  const [headline, ...rest] = normalized.split(REASONING_SPLIT_REGEX)

  return {
    title: headline.replace(REASONING_HEADING_REGEX, "").trim() || "Thinking",
    details: rest.join("\n\n").trim(),
  }
}

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

  const getIsPartStreaming = (part: MessagePart, index: number) => {
    const isLastPart = index === messageParts.length - 1
    const partState = "state" in part ? part.state : undefined

    return partState === "streaming" || (isStreaming && isLastMessage && isLastPart && !partState)
  }

  const reasoningEntries = messageParts.reduce<Array<{ index: number; part: ReasoningPart; isStreaming: boolean }>>(
    (entries, part, index) => {
      if (part.type === "reasoning") {
        entries.push({
          index,
          part: part as ReasoningPart,
          isStreaming: getIsPartStreaming(part, index),
        })
      }

      return entries
    },
    []
  )

  const firstReasoningIndex = reasoningEntries[0]?.index ?? -1

  const renderItems: Array<
    | { key: string; type: "reasoning" }
    | { key: string; text: string; type: "text" }
    | { key: string; part: MessagePart; type: "tool" }
    | { key: string; part: MessagePart; type: "source-url" }
  > = []
  let textBuffer = ""
  let textStartIndex: number | null = null

  const flushTextBuffer = () => {
    if (!textBuffer) {
      return
    }

    renderItems.push({
      key: `${message.id}-text-${textStartIndex ?? renderItems.length}`,
      text: textBuffer,
      type: "text",
    })
    textBuffer = ""
    textStartIndex = null
  }

  for (const [index, part] of messageParts.entries()) {
    if (part.type === "reasoning") {
      if (index === firstReasoningIndex) {
        flushTextBuffer()
        renderItems.push({
          key: `${message.id}-reasoning-group`,
          type: "reasoning",
        })
      }
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
        key: `${message.id}-tool-${index}`,
        part,
        type: "tool",
      })
      continue
    }

    if (part.type === "source-url") {
      renderItems.push({
        key: `${message.id}-source-${index}`,
        part,
        type: "source-url",
      })
    }
  }

  flushTextBuffer()

  const renderReasoningGroup = () => {
    if (!reasoningEntries.length) {
      return null
    }

    const isReasoningStreaming = reasoningEntries.some((entry) => entry.isStreaming)

    return (
      <ChainOfThought
        className="mb-3 rounded-xl border border-border/60 bg-muted/20 px-3 py-3 pb-4"
        defaultOpen={false}
        key={`${message.id}-reasoning-group`}
      >
        <ChainOfThoughtHeader>
          {isReasoningStreaming ? "Thinking..." : "Thought for a few seconds"}
        </ChainOfThoughtHeader>
        <ChainOfThoughtContent className="mt-4">
          {reasoningEntries.map(({ index, part, isStreaming: isEntryStreaming }) => {
            const { title, details } = splitReasoningText(part.text || "")

            return (
              <ChainOfThoughtStep
                className="gap-3 last:[&_[data-chain-line]]:hidden"
                key={`${message.id}-reasoning-step-${index}`}
                label={
                  <MemoizedReactMarkdown
                    className="prose prose-sm dark:prose-invert prose-headings:my-0 prose-p:my-0 prose-pre:my-2 max-w-full break-words prose-pre:p-0"
                    components={components}
                    remarkPlugins={[remarkGfm, remarkMath]}
                  >
                    {title}
                  </MemoizedReactMarkdown>
                }
                status={isEntryStreaming ? "active" : "complete"}
              >
                {details ? (
                  <MemoizedReactMarkdown
                    className="prose prose-sm dark:prose-invert prose-headings:my-0 prose-ol:my-2 prose-p:my-0 prose-pre:my-2 prose-ul:my-2 max-w-full break-words prose-pre:p-0 text-muted-foreground"
                    components={components}
                    remarkPlugins={[remarkGfm, remarkMath]}
                  >
                    {details}
                  </MemoizedReactMarkdown>
                ) : null}
              </ChainOfThoughtStep>
            )
          })}
        </ChainOfThoughtContent>
      </ChainOfThought>
    )
  }

  const renderMessageParts = () => {
    return renderItems.map((item) => {
      let content: ReactNode = null

      if (item.type === "reasoning") {
        content = renderReasoningGroup()
      } else if (item.type === "text") {
        content = (
          <MemoizedReactMarkdown
            className="prose dark:prose-invert flex max-w-full flex-col break-words prose-pre:p-0 prose-p:leading-relaxed"
            components={components}
            remarkPlugins={[remarkGfm, remarkMath]}
          >
            {item.text}
          </MemoizedReactMarkdown>
        )
      } else if (item.type === "tool") {
        content = <ToolInvocationPart part={item.part} />
      } else if (item.type === "source-url" && item.part.type === "source-url") {
        content = (
          <a
            className="my-1 inline-flex items-center gap-1 text-blue-500 text-xs hover:underline"
            href={item.part.url}
            rel="noopener noreferrer"
            target="_blank"
          >
            [{item.part.sourceId}] {item.part.title || item.part.url}
          </a>
        )
      }

      return <Fragment key={item.key}>{content}</Fragment>
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
