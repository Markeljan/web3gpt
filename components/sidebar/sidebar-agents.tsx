import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { AGENTS_ARRAY } from "@/lib/constants"
import { cn } from "@/lib/utils"

export const SidebarAgents = () => {
  return (
    <div className="space-y-1">
      {AGENTS_ARRAY.map((assistant) => (
        <Tooltip key={assistant.id} delayDuration={700}>
          <TooltipTrigger className="focus:bg-muted focus:ring-1 focus:ring-ring w-full">
            <Button
              asChild
              variant="link"
              className={cn(
                "flex w-full items-center justify-start hover:bg-accent hover:text-accent-foreground h-9 hover:no-underline p-2 overflow-clip",
              )}
            >
              <Link className="flex w-full items-center space-x-2" href={`/?a=${assistant.id}`}>
                <div className="relative w-5 h-5 flex-shrink-0">
                  <Image
                    src={assistant.imageUrl}
                    className="object-cover rounded-full"
                    alt={`${assistant.name} image`}
                    fill
                    sizes="20px"
                  />
                </div>
                <p className="text-xs font-medium text-foreground truncate flex-1 text-left">{assistant.name}</p>
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">{assistant.description}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  )
}
