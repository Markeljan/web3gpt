"use client"

import * as React from "react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { IconMoon, IconSun } from "@/components/ui/icons"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const [_, startTransition] = React.useTransition()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          {resolvedTheme === "dark" ? <IconMoon className="transition-all" /> : <IconSun className="transition-all" />}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent sideOffset={8} align="start">
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
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
