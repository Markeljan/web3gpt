import Link from "next/link"

import { auth } from "@/auth"
import { ConnectButton } from "@/components/connect-button"
import { ClearHistory } from "@/components/header/clear-history"
import { LoginButton } from "@/components/header/login-button"
import { SettingsDropDown } from "@/components/header/settings-drop-down"
import { UserMenu } from "@/components/header/user-menu"
import { MetisTeaser } from "@/components/metis-teaser"
import { Sidebar } from "@/components/sidebar/sidebar"
import { SidebarAgents } from "@/components/sidebar/sidebar-agents"
import { SidebarFooter } from "@/components/sidebar/sidebar-footer"
import { SidebarList } from "@/components/sidebar/sidebar-list"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { IconExternalLink, IconSeparator } from "@/components/ui/icons"
import { SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { getChatList } from "@/lib/data/kv"
import { cn } from "@/lib/utils"

export const Header = async () => {
  const chatList = await getChatList()
  const session = await auth()

  const user = session?.user

  return (
    <header className="sticky top-0 z-50 flex h-16 w-full shrink-0 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center">
        <Sidebar>
          <div className="flex flex-col">
            <SheetHeader className="flex flex-row space-x-4 items-baseline p-4">
              <SheetTitle className="text-md">Agents</SheetTitle>
              {/* Mobile-only links section */}

              <Link
                href="https://docs.w3gpt.ai"
                target="_blank"
                className="md:hidden flex items-center gap-1 text-foreground hover:underline"
              >
                Docs
                <IconExternalLink className="size-3.5" />
              </Link>
              <Link
                href="https://d.w3gpt.ai/gg23"
                target="_blank"
                className="md:hidden flex items-center gap-1 text-foreground hover:underline"
              >
                GG23
                <IconExternalLink className="size-3.5" />
              </Link>
            </SheetHeader>
            <SidebarAgents />
          </div>
          <div className="border-t border-muted px-8 mt-4" />
          <SheetHeader className="p-4">
            <SheetTitle className="text-md">Chat History</SheetTitle>
          </SheetHeader>
          {chatList ? (
            <>
              <SidebarList chatList={chatList} />
              <SidebarFooter className="justify-end">
                <ClearHistory />
              </SidebarFooter>
            </>
          ) : null}
        </Sidebar>
        <div className="flex items-center ">
          <IconSeparator className="size-6 text-muted-foreground/50" />
          {user ? (
            <UserMenu user={user} />
          ) : (
            <LoginButton variant="link" showGithubIcon={true} text="Login" className="-ml-2" />
          )}
          <div className="hidden md:block ml-32">
            <Button variant="link" asChild>
              <Link href="https://docs.w3gpt.ai" target="_blank" className="flex items-center gap-1">
                Docs
                <IconExternalLink className="size-3.5" />
              </Link>
            </Button>
            {/* <Button variant="link" asChild>
              <Link href="https://d.w3gpt.ai/gg23" target="_blank" className="flex items-center gap-1">
                <span>Support us on Gitcoin 23</span>
                <IconExternalLink className="size-3.5" />
              </Link>
            </Button> */}
          </div>
          <MetisTeaser />
        </div>
      </div>
      <div className="invisible absolute inset-0 -z-10 flex items-center justify-center md:visible">
        <div className="flex items-center justify-center space-x-4 translate-x-1/2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge className={cn("text-xs text-slate-800 bg-yellow-300 pointer-events-none")}>gpt-4o</Badge>
            </TooltipTrigger>
            <TooltipContent>Using GPT-4o</TooltipContent>
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
