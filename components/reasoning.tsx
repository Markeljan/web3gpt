"use client"

import {
  Content as CollapsibleContent,
  Root as CollapsibleRoot,
  Trigger as CollapsibleTrigger,
} from "@radix-ui/react-collapsible"
import { ChevronDown } from "lucide-react"
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { cn } from "@/lib/utils"

type ReasoningContextValue = {
  isStreaming: boolean
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  duration: number | undefined
}

const ReasoningContext = createContext<ReasoningContextValue | null>(null)

export function useReasoning() {
  const context = useContext(ReasoningContext)
  if (!context) {
    throw new Error("useReasoning must be used within a Reasoning component")
  }
  return context
}

type ReasoningProps = {
  children: ReactNode
  isStreaming?: boolean
  open?: boolean
  defaultOpen?: boolean
  duration?: number
  className?: string
}

export function Reasoning({
  children,
  isStreaming = false,
  open: controlledOpen,
  defaultOpen = false,
  duration: controlledDuration,
  className,
}: ReasoningProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const [duration, setDuration] = useState<number | undefined>(controlledDuration)
  const startTimeRef = useRef<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const isOpen = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen

  const setIsOpen = useCallback(
    (newOpen: boolean) => {
      if (controlledOpen === undefined) {
        setUncontrolledOpen(newOpen)
      }
    },
    [controlledOpen]
  )

  // Auto-open when streaming starts, auto-close when streaming ends
  useEffect(() => {
    if (isStreaming) {
      setIsOpen(true)
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now()
      }
      // Update duration every 100ms while streaming
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000))
        }
      }, 100)
    } else {
      // Clean up interval when streaming stops
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      // Keep final duration
      if (startTimeRef.current) {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000))
      }
      // Auto-close after streaming ends
      setIsOpen(false)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isStreaming, setIsOpen])

  const contextValue = useMemo(
    () => ({
      isStreaming,
      isOpen,
      setIsOpen,
      duration,
    }),
    [isStreaming, isOpen, setIsOpen, duration]
  )

  return (
    <ReasoningContext.Provider value={contextValue}>
      <CollapsibleRoot className={cn("w-full", className)} onOpenChange={setIsOpen} open={isOpen}>
        {children}
      </CollapsibleRoot>
    </ReasoningContext.Provider>
  )
}

type ReasoningTriggerProps = {
  className?: string
}

function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`
  }
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m ${remainingSeconds}s`
}

export function ReasoningTrigger({ className }: ReasoningTriggerProps) {
  const { isStreaming, isOpen, duration } = useReasoning()

  const renderMessage = () => {
    if (isStreaming) {
      return (
        <span className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/60" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            Thinking
          </span>
          {duration !== undefined && duration > 0 && (
            <span className="text-muted-foreground">({formatDuration(duration)})</span>
          )}
        </span>
      )
    }
    return (
      <span className="flex items-center gap-2">
        Thought{duration !== undefined && duration > 0 ? ` for ${formatDuration(duration)}` : ""}
      </span>
    )
  }

  return (
    <CollapsibleTrigger
      className={cn(
        "group flex w-full items-center gap-2 rounded-md py-2 font-medium text-sm transition-colors",
        "text-muted-foreground hover:text-foreground",
        className
      )}
    >
      <ChevronDown
        className={cn("size-4 shrink-0 transition-transform duration-200", isOpen ? "rotate-0" : "-rotate-90")}
      />
      {renderMessage()}
    </CollapsibleTrigger>
  )
}

type ReasoningContentProps = {
  children: string
  className?: string
}

export function ReasoningContent({ children, className }: ReasoningContentProps) {
  const { isStreaming } = useReasoning()

  return (
    <CollapsibleContent
      className={cn(
        "overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down",
        className
      )}
    >
      <div
        className={cn(
          "rounded-md border border-border/50 bg-muted/30 px-4 py-3 text-muted-foreground text-sm",
          "whitespace-pre-wrap leading-relaxed",
          isStreaming && "border-primary/30 bg-primary/5"
        )}
      >
        {children}
        {isStreaming && <span className="ml-0.5 inline-block animate-pulse">▍</span>}
      </div>
    </CollapsibleContent>
  )
}
