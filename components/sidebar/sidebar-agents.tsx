import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { AGENTS_ARRAY } from "@/lib/config"
import { cn } from "@/lib/utils"

export const SidebarAgents = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mx-auto px-2">
      {AGENTS_ARRAY.map((assistant) => (
        <Tooltip key={assistant.id} delayDuration={700}>
          <TooltipTrigger className="focus:bg-muted focus:ring-1 focus:ring-ring">
            <Button
              asChild
              variant="link"
              className={cn(
                "flex w-full items-center justify-start border hover:bg-accent hover:text-accent-foreground rounded-full h-11 hover:no-underline px-0 overflow-clip"
              )}
            >
              <Link className="flex w-full space-x-2" href={`/?a=${assistant.id}`}>
                <div className="relative flex w-1/3 size-12">
                  <Image
                    src={assistant.imageUrl}
                    className="object-cover rounded-full"
                    alt={`${assistant.name} image`}
                    fill
                    sizes="(max-width: 768px) 20vw, 10vw"
                  />
                </div>
                <p className="flex w-2/3 justify-center text-xs font-semibold text-foreground p-2">{assistant.name}</p>
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">{assistant.description}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  )
}
