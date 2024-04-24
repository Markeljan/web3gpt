"use client"

import { useTheme } from "next-themes"

import { useTransition } from "react"
import { Button, buttonVariants } from "@/components/ui/button"
import { IconCog, IconGitHub, IconTelegram, IconTwitter } from "@/components/ui/icons"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function SettingsDropDown() {
  const { setTheme } = useTheme()
  const [_, startTransition] = useTransition()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <>
            <IconCog />
            <span className="sr-only">Toggle theme</span>
          </>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mr-2" sideOffset={8} align="start">
        <DropdownMenuItem
          onClick={() => {
            startTransition(() => {
              setTheme("light")
            })
          }}
        >
          Light
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            startTransition(() => {
              setTheme("dark")
            })
          }}
        >
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            startTransition(() => {
              setTheme("system")
            })
          }}
        >
          System
        </DropdownMenuItem>
        <div className="mx-1 flex flex-row  justify-between border-t pt-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
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
                className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
                href="https://t.me/+Lt21CyCEO0k0Nzcx"
                target="_blank"
                rel="nofollow"
              >
                <IconTelegram />
                <span className="sr-only">Telegram</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent>Telegram</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
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
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
