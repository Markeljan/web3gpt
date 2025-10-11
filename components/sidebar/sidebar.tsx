"use client"

import { Button } from "@/components/ui/button"
import { IconSidebar } from "@/components/ui/icons"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export type SidebarProps = {
  children?: React.ReactNode
}

export const Sidebar = ({ children }: SidebarProps) => (
  <Sheet>
    <SheetTrigger asChild>
      <Button className="-ml-2 size-9 p-0" variant="ghost">
        <IconSidebar className="size-6" />
        <span className="sr-only">Toggle Sidebar</span>
      </Button>
    </SheetTrigger>
    <SheetContent className="inset-y-0 flex h-auto w-[300px] flex-col p-0">{children}</SheetContent>
  </Sheet>
)
