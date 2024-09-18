"use client"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

import { SidebarActions } from "@/components/sidebar/sidebar-actions"
import { SidebarItem } from "@/components/sidebar/sidebar-item"
import { deleteChat, getChatList, shareChat } from "@/lib/actions/db"
import type { DbChatListItem } from "@/lib/types"

export interface SidebarListProps {
  chatList?: DbChatListItem[] | null
}

export function SidebarList({ chatList: initialChatList }: SidebarListProps) {
  const [chatList, setChatList] = useState(initialChatList)
  const pathname = usePathname()
  const activeChatId = pathname.split("/chat/")[1]

  useEffect(() => {
    const fetchChatList = async () => {
      const chatList = await getChatList()
      setChatList(chatList)
    }
    if (!chatList?.find((chat) => chat.id === activeChatId)) {
      fetchChatList()
    }
  }, [activeChatId, chatList])

  return (
    <div className="flex-1 overflow-auto">
      {chatList?.length ? (
        <div className="space-y-2 px-2">
          {chatList?.map((chat) => (
            <SidebarItem key={chat.id} chat={chat} isActive={chat.id === activeChatId}>
              <SidebarActions chat={chat} deleteChat={deleteChat} shareChat={shareChat} />
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
