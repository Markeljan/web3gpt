"use client"

import { sdk } from "@farcaster/miniapp-sdk"
import { useEffect } from "react"

export const MiniAppInitializer = (): React.ReactNode => {
  useEffect(() => {
    const initSdk = async () => {
      await sdk.actions.ready()
    }
    initSdk()
  }, [])

  return null
}
