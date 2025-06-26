import { ConnectButton } from "@/components/connect-button"
import { MetisTeaser } from "@/components/metis-teaser"
import { Sidebar } from "@/components/sidebar/sidebar"
import { SidebarContent } from "@/components/sidebar/sidebar-content"

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 flex h-16 w-full shrink-0 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
      <div className="flex items-center gap-4">
        {/* Mobile Sidebar */}
        <div className="lg:hidden">
          <Sidebar>
            <SidebarContent />
          </Sidebar>
        </div>

        {/* Empty left space for desktop - sidebar handles everything */}
        <div className="hidden lg:block">{/* This space intentionally left empty - sidebar handles navigation */}</div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center justify-end space-x-2">
        <MetisTeaser />
        <ConnectButton />
      </div>
    </header>
  )
}
