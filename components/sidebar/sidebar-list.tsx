"use client"
import { usePathname } from "next/navigation"

import { SidebarActions } from "@/components/sidebar/sidebar-actions"
import { SidebarItem } from "@/components/sidebar/sidebar-item"
import type { DbChatListItem } from "@/lib/types"

export interface SidebarListProps {
  chatList?: DbChatListItem[] | null
}

export function SidebarList({ chatList }: SidebarListProps) {
  const pathname = usePathname()
  const activeChatId = pathname.split("/chat/")[1]

  return (
    <div className="flex-1 overflow-auto">
      {chatList?.length ? (
        <div className="space-y-2 px-2">
          {chatList?.map((chat) => (
            <SidebarItem key={chat.id} chat={chat} isActive={chat.id === activeChatId}>
              <SidebarActions chat={chat} />
            </SidebarItem>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center">
          <p className="text-sm text-muted-foreground">No chat history found</p>
        </div>
      )}
    </div>
  )
}
