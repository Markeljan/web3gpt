"use client"

import { useRouter } from "next/navigation"
import { signOut } from "@/lib/auth-client"

export const SignOutButton = () => {
  const router = useRouter()

  return (
    <button
      className="m-0 flex w-full p-0 text-xs"
      onClick={async () => {
        await signOut()
        router.push("/")
        router.refresh()
      }}
      type="button"
    >
      Log out
    </button>
  )
}
