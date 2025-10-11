"use client"

import { signOut } from "next-auth/react"

export const SignOutButton = () => (
  <button
    className="m-0 flex w-full p-0 text-xs"
    onClick={() => {
      signOut({
        callbackUrl: "/",
      })
    }}
    type="button"
  >
    Log out
  </button>
)
