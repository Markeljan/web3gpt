import * as React from 'react'
import Link from 'next/link'

import { cn } from '@/lib/utils'
import { auth } from '@/auth'
import { clearChats } from '@/app/actions'
import { buttonVariants } from '@/components/ui/button'
import { Sidebar } from '@/components/sidebar'
import { SidebarList } from '@/components/sidebar-list'
import { IconGitHub, IconSeparator, IconTwitter } from '@/components/ui/icons'
import { SidebarFooter } from '@/components/sidebar-footer'
import { ClearHistory } from '@/components/clear-history'
import { UserMenu } from '@/components/user-menu'
import { LoginButton } from '@/components/login-button'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'

export async function Header() {
  const session = await auth()
  return (
    <header className="sticky top-0 z-50 flex h-16 w-full shrink-0 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center">
        <Sidebar>
          <React.Suspense fallback={<div className="flex-1 overflow-auto" />}>
            {/* @ts-ignore */}
            <SidebarList userId={session?.user?.id} />
          </React.Suspense>
          <SidebarFooter className="justify-end">
            {session && <ClearHistory clearChats={clearChats} />}
          </SidebarFooter>
        </Sidebar>
        <div className="flex items-center">
          <IconSeparator className="h-6 w-6 text-muted-foreground/50" />
          {session?.user ? (
            <UserMenu user={session.user} />
          ) : (
            <LoginButton
              variant="link"
              showGithubIcon={true}
              text="Login"
              className="-ml-2"
            />
          )}
        </div>
      </div>
      <div className="invisible absolute inset-0 -z-10 flex items-center justify-center md:visible gap-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              className={`text-xs text-slate-800 bg-yellow-300`}
            >
              GPT-4 Turbo
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            {'Model'}
          </TooltipContent>
        </Tooltip>
        <Image src="/base.webp" alt="web3 gpt logo" width={24} height={24} />
      </div>
      <div className="flex items-center justify-end space-x-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
              href="https://twitter.com/w3gpt_ai"
              target="_blank"
              rel="nofollow"
            >
              <IconTwitter />
              <span className="sr-only">Twitter</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent>Twitter</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
              href="https://github.com/markeljan/web3gpt"
              target="_blank"
              rel="nofollow"
            >
              <IconGitHub />
              <span className="sr-only">Github</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent>Github</TooltipContent>
        </Tooltip>
        <ThemeToggle />
      </div>
    </header>
  )
}
