"use client"

import { Button, type ButtonProps } from "@/components/ui/button"
import { IconArrowDown } from "@/components/ui/icons"
import { useScrollToBottom } from "@/lib/hooks/use-scroll-to-bottom"
import { cn } from "@/lib/utils"

export function ButtonScrollToBottom({ className, ...props }: ButtonProps) {
  const { isAtBottom, scrollToBottom } = useScrollToBottom()

  if (isAtBottom) {
    return null
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn("fixed right-4 bottom-24 z-50 bg-background transition-opacity duration-300 sm:right-8", className)}
      onClick={scrollToBottom}
      {...props}
    >
      <IconArrowDown />
      <span className="sr-only">Scroll to bottom</span>
    </Button>
  )
}
