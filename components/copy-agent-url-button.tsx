"use client"

import { IconCheck, IconCopy } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { APP_URL } from "@/lib/config"
import { useCopyToClipboard } from "@/lib/hooks/use-copy-to-clipboard"

type CopyAgentUrlButtonProps = {
  agentId: string
}

export const CopyAgentUrlButton = ({ agentId }: CopyAgentUrlButtonProps) => {
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 })

  return (
    <Tooltip delayDuration={500}>
      <TooltipTrigger asChild>
        <Button
          className="h-8 w-8 p-0"
          onClick={() => copyToClipboard(`${APP_URL}/?a=${agentId}`)}
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
  )
}
