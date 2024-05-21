import Image from "next/image"
import Link from "next/link"

import { AGENTS_ARRAY } from "@/lib/constants"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export const SidebarAgents = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 px-2 gap-2">
      {AGENTS_ARRAY.map((assistant) => (
        <Tooltip key={assistant.id} delayDuration={500}>
          <TooltipTrigger className="focus:bg-muted focus:ring-1 focus:ring-ring">
            <Link href={`/?a=${assistant.id}`}>
              <div
                className={cn(
                  "flex items-center justify-center space-x-4 px-8 border hover:bg-accent hover:text-accent-foreground rounded-full w-full h-11"
                )}
              >
                <Image src={assistant.imageUrl} alt={assistant.name} width={24} height={24} className="rounded-full" />
                <div className="ml-2 text-sm font-semibold">{assistant.name}</div>
              </div>
            </Link>
          </TooltipTrigger>
          <TooltipContent>{assistant.description}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  )
}
