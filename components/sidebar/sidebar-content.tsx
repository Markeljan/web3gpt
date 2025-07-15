import { auth } from "@/auth"
import { LoginButton } from "@/components/header/login-button"
import { W3GPTLogo } from "@/components/header/logo"
import { Navigation } from "@/components/header/navigation"
import { UserMenu } from "@/components/header/user-menu"
import { SidebarAgents } from "@/components/sidebar/sidebar-agents"
import { SidebarList } from "@/components/sidebar/sidebar-list"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { getChatList } from "@/lib/data/kv"
import { cn } from "@/lib/utils"

export async function SidebarContent() {
  const chatList = await getChatList()
  const session = await auth()
  const user = session?.user

  return (
    <div className="flex flex-col h-full">
      {/* Header Section */}
      <div className="p-6 pb-4 flex-shrink-0">
        <W3GPTLogo className="mb-6" />

        {/* Navigation */}
        <div className="space-y-2">
          <Navigation variant="mobile" />
        </div>
      </div>

      <Separator className="flex-shrink-0" />

      {/* Agents Section */}
      <div className="p-6 py-2 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pointer-events-none select-none">
            Agents
          </h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge className={cn("text-xs text-slate-800 bg-yellow-300 pointer-events-auto")}>gpt-4.1</Badge>
            </TooltipTrigger>
            <TooltipContent>Using GPT-4.1</TooltipContent>
          </Tooltip>
        </div>
        <div className="max-sm:max-h-[108px] overflow-y-auto">
          <SidebarAgents />
        </div>
      </div>

      <Separator className="flex-shrink-0" />

      {/* Chat History Section - Scrollable */}
      <div className="flex-1 flex flex-col px-4 py-2 min-h-0 overflow-hidden">
        <div className="flex items-center justify-between mb-3 flex-shrink-0 px-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pointer-events-none select-none">
            Chats
          </h3>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          {chatList ? (
            <SidebarList chatList={chatList} />
          ) : (
            <div className="flex items-center justify-center h-20">
              <p className="text-sm text-muted-foreground">No chat history</p>
            </div>
          )}
        </div>
      </div>

      <Separator className="flex-shrink-0" />

      {/* User Section - Bottom */}
      <div className="p-4 flex-shrink-0">
        {user ? (
          <div className="rounded-lg bg-muted/50 border overflow-hidden">
            <UserMenu user={user} variant="sidebar" />
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-muted/50 border">
            <LoginButton
              variant="ghost"
              showGithubIcon={true}
              text="Sign in to continue"
              className="w-full justify-start"
            />
          </div>
        )}
      </div>
    </div>
  )
}
