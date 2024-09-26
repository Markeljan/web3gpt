"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { IconCheck, IconCopy, IconRefresh, IconSpinner } from "@/components/ui/icons"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { APP_URL } from "@/lib/config"
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
  const agentUrl = `${APP_URL}?a=${agent.id}`

  return (
    <>
      <div
        className={cn(
          "flex flex-col mx-auto max-w-2xl h-96 text-center items-center justify-center bg-background border-gray-600/25 dark:border-gray-600/50 md:border rounded-2xl mb-8 md:mb-12 px-4 pt-8 pb-4",
          className
        )}
      >
        <div className="relative size-48">
          <Image
            src={agent.imageUrl}
            className="object-contain"
            alt={`${agent.name} image`}
            priority={true}
            fill
            sizes="(max-width: 768px) 60vw, 20vw"
          />
        </div>
        <div className="flex flex-col items-center justify-center w-full space-y-2">
          <p className="text-md font-bold tracking-tight lg:text-2xl lg:font-normal">{agent.name}</p>
          <p className="text-md font-normal tracking-tight lg:text-lg lg:font-normal">{agent.description}</p>
          <p className="text-sm font-normal tracking-tight lg:text-md lg:font-normal">created by {agent.creator} </p>

          <div className="flex flex-row gap-2">
            {setThreadId ? (
              <Tooltip delayDuration={500}>
                <TooltipTrigger asChild>
                  <Button
                    type="reset"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      startTransition(() => {
                        setThreadId(undefined)
                        router.push(`/?a=${agent.id}`)
                      })
                    }}
                    disabled={isPending}
                    className={cn("flex size-8 p-0 sm:right-4")}
                  >
                    {isPending ? <IconSpinner className="size-8 animate-spin text-gray-500" /> : <IconRefresh />}
                    <span className="sr-only">New Chat</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>New Chat</TooltipContent>
              </Tooltip>
            ) : null}
            <Tooltip delayDuration={500}>
              <TooltipTrigger asChild>
                <Button type="button" variant="ghost" size="icon" onClick={() => copyToClipboard(agentUrl)}>
                  {isCopied ? <IconCheck /> : <IconCopy />}
                  <span className="sr-only">Agent URL</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Agent URL</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </>
  )
}
