"use client"

import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { IconMessage, IconUsers } from "@/components/ui/icons"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { DbChatListItem } from "@/lib/types"
import { cn } from "@/lib/utils"

interface SidebarItemProps {
  chat: DbChatListItem
  isActive: boolean
  children: React.ReactNode
}

export function SidebarItem({ chat, isActive, children }: SidebarItemProps) {
  if (!chat?.id) return null

  return (
    <div className="relative group">
      <div className="absolute left-2 top-1 flex size-6 items-center justify-center">
        {chat.published ? (
          <Tooltip delayDuration={1000}>
            <TooltipTrigger tabIndex={-1} className="focus:bg-muted focus:ring-1 focus:ring-ring">
              <IconUsers className="mr-2" />
            </TooltipTrigger>
            <TooltipContent>This is a published chat.</TooltipContent>
          </Tooltip>
        ) : (
          <IconMessage className="mr-2" />
        )}
      </div>
      <Link
        href={`/chat/${chat.id}`}
        className={cn(buttonVariants({ variant: "ghost" }), "w-full pl-8 pr-4", isActive && "bg-accent pr-16")}
      >
        <div className="relative max-h-5 flex-1 select-none overflow-hidden text-ellipsis break-all" title={chat.title}>
          <span className="whitespace-nowrap">{chat.title}</span>
        </div>
      </Link>
      <div className={cn("hidden absolute right-2 top-1", isActive && "block")}>{children}</div>
    </div>
  )
}
