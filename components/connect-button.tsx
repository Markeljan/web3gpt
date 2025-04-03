"use client";

import { ConnectButton as RainbowkitConnectButton } from "@rainbow-me/rainbowkit";
import { useSafeAutoConnect } from "@/lib/hooks/use-safe-auto-connect";

export function ConnectButton() {
  useSafeAutoConnect();

  return <RainbowkitConnectButton />;
}
