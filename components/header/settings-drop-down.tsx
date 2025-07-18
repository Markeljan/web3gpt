"use client"

import Link from "next/link"
import { useTheme } from "next-themes"
import { useTransition } from "react"

import { Button, buttonVariants } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { IconCog, IconGitHub, IconTelegram, IconTwitter } from "@/components/ui/icons"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export function SettingsDropDown() {
  const { setTheme } = useTheme()
  const [_, startTransition] = useTransition()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <IconCog />
          <span className="sr-only">Toggle theme</span>
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
        <div className="mx-1 flex flex-row justify-between border-t pt-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
                href="https://twitter.com/w3gptai"
                target="_blank"
                rel="noopener noreferrer"
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
                href="https://t.me/w3gptai"
                target="_blank"
                rel="noopener noreferrer"
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
                rel="noopener noreferrer"
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
