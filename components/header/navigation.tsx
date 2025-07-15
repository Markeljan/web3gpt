"use client"

import { ExternalLink } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { NAVIGATION_ITEMS } from "@/components/sidebar/constants"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface NavigationProps {
  className?: string
  variant?: "desktop" | "mobile"
}

export function Navigation({ className, variant = "desktop" }: NavigationProps) {
  const pathname = usePathname()

  if (variant === "mobile") {
    return (
      <nav className={cn("flex flex-col space-y-2", className)}>
        {NAVIGATION_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = !item.external && pathname === item.href
          const isExternal = item.external

          return (
            <Link
              key={item.name}
              href={item.href}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.name}</span>
              {item.badge && (
                <span className="ml-auto bg-primary/20 text-primary px-1.5 py-0.5 rounded text-xs font-semibold">
                  {item.badge}
                </span>
              )}
              {isExternal && <ExternalLink className="h-3 w-3 ml-auto" />}
            </Link>
          )
        })}
      </nav>
    )
  }

  return (
    <nav className={cn("flex items-center space-x-1", className)}>
      {NAVIGATION_ITEMS.map((item) => {
        const Icon = item.icon
        const isActive = !item.external && pathname === item.href
        const isExternal = item.external

        return (
          <Button
            key={item.name}
            variant={isActive ? "secondary" : "ghost"}
            size="sm"
            asChild
            className={cn("relative", isActive && "bg-muted hover:bg-muted/80")}
          >
            <Link
              href={item.href}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              <span>{item.name}</span>
              {item.badge && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full text-xs font-semibold">
                  {item.badge}
                </span>
              )}
            </Link>
          </Button>
        )
      })}
    </nav>
  )
}
