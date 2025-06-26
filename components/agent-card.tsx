"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { IconCheck, IconCopy, IconPlus, IconSpinner } from "@/components/ui/icons"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { DEPLOYMENT_URL } from "@/lib/config"
import { useCopyToClipboard } from "@/lib/hooks/use-copy-to-clipboard"
import type { Agent } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useTransition } from "react"

type AgentCardProps = {
  agent: Agent
  className?: string
  setThreadId?: (threadId: string | undefined) => void
}

export const AgentCard = ({ agent, setThreadId, className }: AgentCardProps) => {
  const router = useRouter()
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 })
  const [isPending, startTransition] = useTransition()

  return (
    <div
      className={cn(
        "flex items-center gap-4 mx-auto max-w-2xl p-4 bg-background/50 border-gray-600/20 dark:border-gray-600/30 border rounded-lg mb-8",
        className,
      )}
    >
      <div className="relative size-16 flex-shrink-0">
        <Image
          src={agent.imageUrl}
          className="object-contain rounded-lg"
          alt={`${agent.name} image`}
          priority={true}
          fill
          sizes="64px"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-lg truncate">{agent.name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{agent.description}</p>
        <p className="text-xs text-gray-500 mt-1">by {agent.creator}</p>
      </div>
      <div className="flex gap-1 flex-shrink-0">
        {setThreadId ? (
          <Tooltip delayDuration={500}>
            <TooltipTrigger asChild>
              <Button
                type="reset"
                variant="ghost"
                size="sm"
                onClick={() => {
                  startTransition(() => {
                    setThreadId(undefined)
                    router.push(`/?a=${agent.id}`)
                  })
                }}
                disabled={isPending}
                className="h-8 w-8 p-0"
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
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(`${DEPLOYMENT_URL}?a=${agent.id}`)}
              className="h-8 w-8 p-0"
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
