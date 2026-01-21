import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { IconPlus, IconSpinner } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

type NewChatButtonProps = {
  agentId: string
  onNewChat: () => void
}

export const NewChatButton = ({ agentId, onNewChat }: NewChatButtonProps) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  return (
    <Tooltip delayDuration={500}>
      <TooltipTrigger asChild>
        <Button
          className="h-8 w-8 p-0"
          disabled={isPending}
          onClick={() => {
            startTransition(() => {
              onNewChat()
              router.push(`/?a=${agentId}`)
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
  )
}
