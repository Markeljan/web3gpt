"use client"

import Image from "next/image"
import Link from "next/link"
import type { Session } from "next-auth"
import { useTheme } from "next-themes"
import { useState, useTransition } from "react"

import { SignOutButton } from "@/components/sign-out-button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  IconClear,
  IconCog,
  IconGitHub,
  IconMoon,
  IconPC,
  IconSpinner,
  IconSun,
  IconTelegram,
  IconTwitter,
} from "@/components/ui/icons"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { clearChatsAction } from "@/lib/actions/chat"
import { cn } from "@/lib/utils"

function getUserInitials(name: string) {
  const [firstName, lastName] = name.split(" ")

  return lastName ? `${firstName[0]}${lastName[0]}` : firstName.slice(0, 2)
}

interface UserMenuProps {
  user: Session["user"]
  variant?: "header" | "sidebar" | "collapsed"
  showClearHistory?: boolean
}

export const UserMenu = ({ user, variant = "header", showClearHistory = false }: UserMenuProps) => {
  const { setTheme, theme } = useTheme()
  const [_, startTransition] = useTransition()
  const [clearHistoryOpen, setClearHistoryOpen] = useState(false)
  const [isClearPending, startClearTransition] = useTransition()

  const renderClearHistory = () => {
    if (!showClearHistory) return null

    return (
      <>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <AlertDialog open={clearHistoryOpen} onOpenChange={setClearHistoryOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" className="w-full justify-start p-0 h-auto font-normal" disabled={isClearPending}>
                {isClearPending && <IconSpinner className="mr-2" />}
                <IconClear className="mr-2 h-4 w-4" />
                Clear History
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete your chat history and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isClearPending}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  disabled={isClearPending}
                  onClick={(event) => {
                    event.preventDefault()
                    startClearTransition(async () => {
                      await clearChatsAction()
                      setClearHistoryOpen(false)
                    })
                  }}
                >
                  {isClearPending ? <IconSpinner className="mr-2 animate-spin" /> : null}
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuItem>
      </>
    )
  }

  const renderSettingsItems = () => (
    <>
      <DropdownMenuSeparator />
      <div className="mx-1 flex flex-row justify-between py-1 px-6">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={theme === "light" ? "default" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                startTransition(() => {
                  setTheme("light")
                })
              }}
            >
              <IconSun className="h-4 w-4" />
              <span className="sr-only">Light theme</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Light theme</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={theme === "dark" ? "default" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                startTransition(() => {
                  setTheme("dark")
                })
              }}
            >
              <IconMoon className="h-4 w-4" />
              <span className="sr-only">Dark theme</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Dark theme</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={theme === "system" ? "default" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                startTransition(() => {
                  setTheme("system")
                })
              }}
            >
              <IconPC className="h-4 w-4" />
              <span className="sr-only">System theme</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>System theme</TooltipContent>
        </Tooltip>
      </div>
      <DropdownMenuSeparator />
      <div className="mx-1 flex flex-row justify-between py-1 px-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8")}
              href="https://x.com/w3gptai"
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconTwitter className="h-4 w-4" />
              <span className="sr-only">X</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent>Twitter</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8")}
              href="https://t.me/w3gptai"
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconTelegram className="h-4 w-4" />
              <span className="sr-only">Telegram</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent>Telegram</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8")}
              href="https://github.com/markeljan/web3gpt"
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconGitHub className="h-4 w-4" />
              <span className="sr-only">Github</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent>Github</TooltipContent>
        </Tooltip>
      </div>
    </>
  )
  if (variant === "collapsed") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="w-10 h-10 p-0 rounded-full">
            {user?.image ? (
              <Image
                className="w-8 h-8 select-none rounded-full ring-1 ring-zinc-100/10 transition-opacity duration-300 hover:opacity-80"
                src={`${user.image}&s=60`}
                alt="User profile image"
                width={32}
                height={32}
              />
            ) : (
              <div className="flex w-8 h-8 shrink-0 select-none items-center justify-center rounded-full bg-muted/50 text-xs font-medium uppercase text-muted-foreground">
                {user?.name ? getUserInitials(user?.name) : null}
              </div>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" sideOffset={8} align="end" className="w-[220px]">
          <DropdownMenuItem className="flex-col items-start">
            <div className="text-xs font-medium">{user?.name}</div>
            <div className="text-xs text-zinc-500">{user?.email}</div>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <SignOutButton />
          </DropdownMenuItem>
          {renderClearHistory()}
          {renderSettingsItems()}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  if (variant === "sidebar") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="w-full justify-start p-3 h-auto hover:bg-accent/50">
            <div className="flex items-center gap-3 w-full">
              {user?.image ? (
                <Image
                  className="size-8 select-none rounded-full ring-1 ring-zinc-100/10 transition-opacity duration-300 hover:opacity-80"
                  src={`${user.image}&s=60`}
                  alt="User profile image"
                  width={32}
                  height={32}
                />
              ) : (
                <div className="flex size-8 shrink-0 select-none items-center justify-center rounded-full bg-muted/50 text-xs font-medium uppercase text-muted-foreground">
                  {user?.name ? getUserInitials(user?.name) : null}
                </div>
              )}
              <div className="flex-1 text-left min-w-0">
                <div className="text-sm font-medium truncate">{user?.name}</div>
                <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
              </div>
              <IconCog className="size-4 text-muted-foreground mr-2" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent sideOffset={8} align="start" className="w-[220px]">
          <DropdownMenuItem className="flex-col items-start">
            <div className="text-xs font-medium">{user?.name}</div>
            <div className="text-xs text-zinc-500">{user?.email}</div>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <SignOutButton />
          </DropdownMenuItem>
          {renderClearHistory()}
          {renderSettingsItems()}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <div className="flex items-center justify-between">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="px-2">
            {user?.image ? (
              <Image
                className="size-6 select-none rounded-full ring-1 ring-zinc-100/10 transition-opacity duration-300 hover:opacity-80"
                src={`${user.image}&s=60`}
                alt="User profile image"
                width={24}
                height={24}
              />
            ) : (
              <div className="flex size-7 shrink-0 select-none items-center justify-center rounded-full bg-muted/50 text-xs font-medium uppercase text-muted-foreground">
                {user?.name ? getUserInitials(user?.name) : null}
              </div>
            )}
            <span className="ml-2 hidden lg:flex">{user?.name && user?.name}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent sideOffset={8} align="start" className="w-[220px]">
          <DropdownMenuItem className="flex-col items-start">
            <div className="text-xs font-medium">{user?.name}</div>
            <div className="text-xs text-zinc-500">{user?.email}</div>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <SignOutButton />
          </DropdownMenuItem>
          {renderClearHistory()}
          {renderSettingsItems()}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
