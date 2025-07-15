"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Session } from "next-auth"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { SidebarCollapsed } from "./sidebar-collapsed"

interface PermanentSidebarProps {
  children: React.ReactNode
  className?: string
  user?: Session["user"]
}

export function PermanentSidebar({ children, className, user }: PermanentSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute("data-sidebar-collapsed", isCollapsed.toString())
  }, [isCollapsed])

  return (
    <div
      className={cn(
        "relative hidden lg:flex flex-col bg-muted/20 border-r border-border transition-all duration-300 ease-in-out h-full",
        isCollapsed ? "w-16" : "w-80",
        className,
      )}
    >
      {/* Collapse Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 z-10 h-6 w-6 rounded-full border bg-background shadow-md hover:bg-accent"
      >
        {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>

      {/* Sidebar Content */}
      <div className={cn("flex flex-col h-full overflow-hidden")}>
        {isCollapsed ? <SidebarCollapsed user={user} /> : children}
      </div>
    </div>
  )
}
