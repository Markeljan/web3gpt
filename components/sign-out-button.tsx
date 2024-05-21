"use client"

import { signOut } from "next-auth/react"

export const SignOutButton = () => {
  return (
    <button
      onClick={() => {
        signOut({
          callbackUrl: "/"
        })
      }}
      type="button"
      className="flex w-full p-0 m-0 text-xs"
    >
      Log out
    </button>
  )
}
