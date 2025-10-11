"use client"

import { connectorsForWallets, darkTheme, lightTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit"
import { getWagmiConfig } from "@/lib/config"
import "@rainbow-me/rainbowkit/styles.css"
import {
  coinbaseWallet,
  injectedWallet,
  metaMaskWallet,
  rainbowWallet,
  safeWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useTheme } from "next-themes"
import { useState } from "react"
import { DEPLOYMENT_URL } from "vercel-url"
import { type State, WagmiProvider } from "wagmi"

const NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ""

export const getConnectors = () => {
  if (typeof window === "undefined") {
    return []
  }

  return connectorsForWallets(
    [
      {
        groupName: "Recommended",
        wallets: [coinbaseWallet, metaMaskWallet, rainbowWallet, walletConnectWallet, injectedWallet, safeWallet],
      },
    ],
    {
      appName: "Web3GPT",
      appDescription: "Write and deploy Solidity smart contracts with AI",
      appUrl: DEPLOYMENT_URL,
      appIcon: "/assets/web3gpt.png",
      projectId: NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
    }
  )
}

export function Web3Provider({
  children,
  initialState,
}: {
  children: React.ReactNode
  initialState: State | undefined
}) {
  const { resolvedTheme } = useTheme()
  const [config] = useState(() => getWagmiConfig(getConnectors()))
  const [queryClient] = useState(() => new QueryClient())

  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          appInfo={{
            appName: "Web3GPT",
            disclaimer: ({ Text, Link }) => (
              <Text>
                Web3GPT is an experimental AI tool. Beware of the{" "}
                <Link href="https://docs.soliditylang.org/en/latest/security-considerations.html">risks</Link>{" "}
                associated with deploying smart contracts.
              </Text>
            ),
            learnMoreUrl: "https://x.com/w3gptai",
          }}
          theme={
            resolvedTheme === "dark"
              ? darkTheme({
                  accentColor: "#21C55E",
                  accentColorForeground: "black",
                })
              : lightTheme({
                  accentColor: "#21C55E",
                  accentColorForeground: "white",
                })
          }
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
