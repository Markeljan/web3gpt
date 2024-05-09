import { getChatList, removeChat, shareChat } from "@/app/actions"
import { SidebarActions } from "@/components/sidebar/sidebar-actions"
import { SidebarItem } from "@/components/sidebar/sidebar-item"
import { LoginButton } from "@/components/header/login-button"

export interface SidebarListProps {
  userId?: string
}

export async function SidebarList({ userId }: SidebarListProps) {
  const chats = await getChatList()

  return (
    <div className="flex-1 overflow-auto">
      {chats?.length ? (
        <div className="space-y-2 px-2">
          {chats.map((chat) => (
            <SidebarItem key={chat.id} chat={chat}>
              <SidebarActions chat={chat} removeChat={removeChat} shareChat={shareChat} />
            </SidebarItem>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center">
          {userId ? (
            <p className="text-sm text-muted-foreground">No chat history</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              <LoginButton variant="link" text="Login" showGithubIcon={false} className="pr-0" /> to save chat history.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
