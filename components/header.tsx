import { Suspense } from "react"
import { auth } from "@/auth"
import { clearChats } from "@/app/actions"
import { Sidebar } from "@/components/sidebar"
import { SidebarList } from "@/components/sidebar-list"
import { IconExternalLink, IconSeparator } from "@/components/ui/icons"
import { SidebarFooter } from "@/components/sidebar-footer"
import { ClearHistory } from "@/components/clear-history"
import { UserMenu } from "@/components/user-menu"
import { LoginButton } from "@/components/login-button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { ConnectButton } from "@/components/connect-button"
import { SettingsDropDown } from "./settings-drop-down"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Button } from "./ui/button"

export async function Header() {
  const session = await auth()
  const isSignedIn = !!session?.user
  return (
    <header className="sticky top-0 z-50 flex h-16 w-full shrink-0 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center">
        <Sidebar>
          <Suspense fallback={<div className="flex-1 overflow-auto" />}>
            <SidebarList userId={`${session?.user?.id}`} />
          </Suspense>
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
              <Badge
                className={cn("text-xs text-slate-800", {
                  "bg-yellow-300": isSignedIn,
                  "bg-gray-300": !isSignedIn
                })}
              >
                {isSignedIn ? "GPT-4" : "GPT-3.5"}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>{isSignedIn ? "GPT-4 Turbo" : "Login for GPT-4"}</TooltipContent>
          </Tooltip>
          <Link className="flex" href="https://d.w3gpt.ai/gg20" target="_blank" rel="noreferrer">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="link" className="text-xs">
                  Gitcoin GG20 <IconExternalLink className="size-4 ml-1" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Support us in the GG20 Developer Tooling Track!</TooltipContent>
            </Tooltip>
          </Link>
        </div>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <ConnectButton />
        <SettingsDropDown />
      </div>
    </header>
  )
}
