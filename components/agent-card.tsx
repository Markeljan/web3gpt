import type { UIMessage } from "ai"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { IconCheck, IconCopy, IconPlus, IconSpinner } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useCopyToClipboard } from "@/lib/hooks/use-copy-to-clipboard"
import type { Agent } from "@/lib/types"
import { cn } from "@/lib/utils"

type AgentCardProps = {
  agent: Agent
  className?: string
  onNewChat?: () => void
  setMessages?: (messages: UIMessage[]) => void
}

export const AgentCard = ({ agent, onNewChat, setMessages, className }: AgentCardProps) => {
  const router = useRouter()
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 })
  const [isPending, startTransition] = useTransition()
  const [descriptionClamped, setDescriptionClamped] = useState(true)

  const handleToggleDescriptionClamped = () => {
    setDescriptionClamped(!descriptionClamped)
  }

  return (
    <div
      className={cn(
        "mx-auto mb-8 flex max-w-2xl items-start gap-4 rounded-lg border border-gray-600/20 bg-background/50 p-4 dark:border-gray-600/30",
        className
      )}
    >
      <div className="relative mt-4 size-16 flex-shrink-0">
        <Image
          alt={`${agent.name} image`}
          className="rounded-lg object-contain"
          fill
          priority={true}
          sizes="64px"
          src={agent.imageUrl}
        />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-semibold text-lg">{agent.name}</h3>
        <p
          className={cn(
            "text-gray-600 text-sm dark:text-gray-400",
            descriptionClamped ? "line-clamp-2" : "line-clamp-none"
          )}
        >
          <span>{agent.description}</span>
        </p>
        <div className="flex w-full items-center justify-end gap-1 text-gray-500 text-xs hover:text-gray-600 dark:hover:text-gray-400">
          <button onClick={handleToggleDescriptionClamped} type="button">
            {descriptionClamped ? "Show more" : "Show less"}
          </button>
        </div>
        <p className="mt-1 text-gray-500 text-xs">by {agent.creator}</p>
      </div>
      <div className="flex flex-shrink-0 gap-1">
        {onNewChat ? (
          <Tooltip delayDuration={500}>
            <TooltipTrigger asChild>
              <Button
                className="h-8 w-8 p-0"
                disabled={isPending}
                onClick={() => {
                  startTransition(() => {
                    onNewChat()
                    setMessages?.([])
                    router.push(`/?a=${agent.id}`)
                  })
                }}
                size="sm"
                type="reset"
                variant="ghost"
              >
                {isPending ? <IconSpinner className="size-4 animate-spin" /> : <IconPlus className="size-4" />}
                <span className="sr-only">New Chat</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>New Chat</TooltipContent>
          </Tooltip>
        ) : null}
        <Tooltip delayDuration={500}>
          <TooltipTrigger asChild>
            <Button
              className="h-8 w-8 p-0"
              onClick={() => copyToClipboard(`https://w3gpt.ai/?a=${agent.id}`)}
              size="sm"
              type="button"
              variant="ghost"
            >
              {isCopied ? <IconCheck className="size-4" /> : <IconCopy className="size-4" />}
              <span className="sr-only">Agent URL</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Agent URL</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}
