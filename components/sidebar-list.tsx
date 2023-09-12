import { getChats, removeChat, shareChat } from '@/app/actions'
import { SidebarActions } from '@/components/sidebar-actions'
import { SidebarItem } from '@/components/sidebar-item'
import { LoginButton } from './login-button'

export interface SidebarListProps {
  userId?: string
}

export async function SidebarList({ userId }: SidebarListProps) {
  const chats = await getChats(userId)

  return (
    <div className="flex-1 overflow-auto">
      {chats?.length ? (
        <div className="space-y-2 px-2">
          {chats.map(
            chat =>
              chat && (
                <SidebarItem key={chat?.id} chat={chat}>
                  <SidebarActions
                    chat={chat}
                    removeChat={removeChat}
                    shareChat={shareChat}
                  />
                </SidebarItem>
              )
          )}
        </div>
      ) : (
        <div className="p-8 text-center">
          {userId ?
            <p className="text-sm text-muted-foreground">No chat history</p>
            :
            <p className="text-sm text-muted-foreground">
              <LoginButton variant="link" text="Login" showGithubIcon={false} className="pr-0"
              /> to save chat history and enable gpt-4.
            </p>}

        </div>
      )}
    </div>
  )
}
