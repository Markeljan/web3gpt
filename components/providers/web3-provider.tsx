"use client"

import { mantleSepolia } from "@/lib/mantle-sepolia"
import { FULL_RPC_URLS } from "@/lib/viem-utils"
import { RainbowKitProvider, darkTheme, getDefaultConfig, lightTheme } from "@rainbow-me/rainbowkit"
import "@rainbow-me/rainbowkit/styles.css"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useTheme } from "next-themes"
import { http, WagmiProvider } from "wagmi"
import { baseSepolia, holesky, polygonAmoy, sepolia } from "wagmi/chains"

const mantleSepoliaWithLogo = {
  ...mantleSepolia,
  iconUrl: "/mantle-logo.jpeg"
}

const amoyWithLogo = {
  ...polygonAmoy,
  iconUrl: "/polygon-logo.png"
}

const chains = [mantleSepoliaWithLogo, baseSepolia, holesky, amoyWithLogo, sepolia] as const

const queryClient = new QueryClient()

const config = getDefaultConfig({
  appName: "Web3 GPT",
  appDescription: "Web3 GPT is a decentralized application that allows you to interact with the blockchain.",
  appUrl: "https://w3gpt.ai",
  appIcon: "/favicon.ico",
  projectId: `${process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID}`,
  chains: chains,
  transports: {
    [sepolia.id]: http(FULL_RPC_URLS[sepolia.id]),
    [amoyWithLogo.id]: http(FULL_RPC_URLS[amoyWithLogo.id]),
    [baseSepolia.id]: http(FULL_RPC_URLS[baseSepolia.id]),
    [mantleSepoliaWithLogo.id]: http(),
    [holesky.id]: http()
  },
  ssr: true
})

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme()

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          initialChain={mantleSepoliaWithLogo}
          theme={
            resolvedTheme === "dark"
              ? darkTheme({
                  accentColor: "#21C55E",
                  accentColorForeground: "black"
                })
              : lightTheme({
                  accentColor: "#21C55E",
                  accentColorForeground: "white"
                })
          }
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
