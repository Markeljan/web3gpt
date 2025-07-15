"use client"

import { useEffect } from "react"

export const MiniAppInitializer = (): React.ReactNode => {
  useEffect(() => {
    const url = new URL(window.location.href)
    const isMini = url.pathname.startsWith("/mini") || url.searchParams.get("miniApp") === "true"

    if (isMini) {
      import("@farcaster/miniapp-sdk").then(({ sdk }) => {
        sdk.actions.ready()
      })
    }
  }, [])

  return null
}
