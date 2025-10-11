"use client"

import { ConnectButton as RainbowkitConnectButton } from "@rainbow-me/rainbowkit"

import { useSafeAutoConnect } from "@/lib/hooks/use-safe-auto-connect"

export const ConnectButton = () => {
  useSafeAutoConnect()

  return <RainbowkitConnectButton />
}
