import Image from "next/image"

import type { Agent } from "@/lib/types"
import { cn } from "@/lib/utils"

type AgentCardProps = {
  agent: Agent
  className?: string
}

export const AgentCard = ({ agent, className }: AgentCardProps) => {
  return (
    <>
      <div
        className={cn(
          "flex flex-col mx-auto  text-center items-center justify-center mb-8 max-w-2xl bg-background rounded-2xl border-gray-600/25 p-8 dark:border-gray-600/50 md:mb-12 md:border space-y-8",
          className
        )}
      >
        <Image src={agent.imageUrl} alt={`${agent.name} image`} priority={true} width={160} height={160} />
        <div className="flex flex-col items-center justify-center w-full space-y-2">
          <p className="text-md font-bold tracking-tight lg:text-2xl lg:font-normal">Agent: {agent.name}</p>
          <p className="text-md font-normal tracking-tight lg:text-lg lg:font-normal">{agent.description}</p>
          <p className="text-sm font-normal tracking-tight lg:text-md lg:font-normal">created by {agent.creator} </p>
        </div>
      </div>
    </>
  )
}
