"use client"

import { sdk } from "@farcaster/miniapp-sdk"
import { useEffect } from "react"

export const MiniAppInitializer = (): React.ReactNode => {
  useEffect(() => {
    const initialize = async () => {
      await sdk.actions.ready()
    }
    initialize()
  }, [])

  return null
}
