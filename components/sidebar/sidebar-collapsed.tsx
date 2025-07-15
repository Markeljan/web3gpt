"use client"

import { User } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { Session } from "next-auth"
import { UserMenu } from "@/components/header/user-menu"
import { NAVIGATION_ITEMS } from "@/components/sidebar/constants"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface SidebarCollapsedProps {
  user?: Session["user"]
}

export function SidebarCollapsed({ user }: SidebarCollapsedProps) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full items-center py-4">
      {/* Logo */}
      <div className="mb-6">
        <Link href="/" className="block">
          <Tooltip>
            <TooltipTrigger asChild>
              <Image src="/assets/web3gpt.png" alt="Web3GPT" width={32} height={32} className="rounded-lg" />
            </TooltipTrigger>
            <TooltipContent side="right">Web3GPT</TooltipContent>
          </Tooltip>
        </Link>
      </div>

      {/* Navigation Icons */}
      <div className="flex flex-col space-y-2 mb-6">
        {NAVIGATION_ITEMS.map((item) => {
          const Icon = item.icon
          const isExternal = item.external
          const isActive = !isExternal && pathname === item.href

          return (
            <Tooltip key={item.name}>
              <TooltipTrigger asChild>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  asChild
                  className={cn("w-10 h-10 p-0", isActive && "bg-muted hover:bg-muted/80")}
                >
                  <Link
                    href={item.href}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">{item.name}</TooltipContent>
            </Tooltip>
          )
        })}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* User Profile at Bottom */}
      <div className="mt-auto">
        {user ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-10 h-10">
                <UserMenu user={user} variant="collapsed" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <div className="text-xs">
                <div className="font-medium">{user.name}</div>
                <div className="text-muted-foreground">{user.email}</div>
              </div>
            </TooltipContent>
          </Tooltip>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="w-10 h-10 p-0">
                <User className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Sign in</TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  )
}
