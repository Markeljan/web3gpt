import Image from "next/image"

import type { Session } from "next-auth"

import { SignOutButton } from "@/components/sign-out-button"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

function getUserInitials(name: string) {
  const [firstName, lastName] = name.split(" ")
  return lastName ? `${firstName[0]}${lastName[0]}` : firstName.slice(0, 2)
}

export const UserMenu = ({ user }: { user: Session["user"] }) => {
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
            <span className="ml-2 hidden lg:flex">{user?.name && getUserInitials(user?.name)}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent sideOffset={8} align="start" className="w-[180px]">
          <DropdownMenuItem className="flex-col items-start">
            <div className="text-xs font-medium">{user?.name}</div>
            <div className="text-xs text-zinc-500">{user?.email}</div>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <SignOutButton />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
