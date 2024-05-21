import { clearChats } from "@/lib/actions/db"
import { auth } from "@/auth"
import { ConnectButton } from "@/components/connect-button"
import { ClearHistory } from "@/components/header/clear-history"
import { LoginButton } from "@/components/header/login-button"
import { SettingsDropDown } from "@/components/header/settings-drop-down"
import { UserMenu } from "@/components/header/user-menu"
import Sidebar from "@/components/sidebar"
import { SidebarAgents } from "@/components/sidebar/sidebar-agents"
import { SidebarFooter } from "@/components/sidebar/sidebar-footer"
import { SidebarList } from "@/components/sidebar/sidebar-list"
import { Badge } from "@/components/ui/badge"
import { IconSeparator } from "@/components/ui/icons"
import { SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export default async function Header() {
  const session = await auth()
  const isSignedIn = !!session?.user
  return (
    <header className="sticky top-0 z-50 flex h-16 w-full shrink-0 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center">
        <Sidebar>
          <div className="flex flex-col space-y-4">
            <SheetHeader className="p-4 pt-8">
              <SheetTitle className="text-md">Agents</SheetTitle>
            </SheetHeader>
            <SidebarAgents />
          </div>
          {/* divider line */}
          <div className="border-t border-muted px-8 mt-4" />
          <SheetHeader className="p-4">
            <SheetTitle className="text-md">Chat History</SheetTitle>
          </SheetHeader>
          <SidebarList userId={`${session?.user?.id}`} />
          <SidebarFooter className="justify-end">
            {isSignedIn && <ClearHistory clearChats={clearChats} />}
          </SidebarFooter>
        </Sidebar>
        <div className="flex items-center">
          <IconSeparator className="size-6 text-muted-foreground/50" />
          {session?.user ? (
            <UserMenu user={session.user} />
          ) : (
            <LoginButton variant="link" showGithubIcon={true} text="Login" className="-ml-2" />
          )}
        </div>
      </div>
      <div className="invisible absolute inset-0 -z-10 flex items-center justify-center md:visible">
        <div className="flex items-center justify-center space-x-4 translate-x-1/2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge className={cn("text-xs text-slate-800 bg-yellow-300")}>GPT-4o</Badge>
            </TooltipTrigger>
            <TooltipContent>Using the latest GPT-4o</TooltipContent>
          </Tooltip>
        </div>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <ConnectButton />
        <SettingsDropDown />
      </div>
    </header>
  )
}
