"use client"

import { RainbowKitProvider, darkTheme, getDefaultConfig, lightTheme } from "@rainbow-me/rainbowkit"
import "@rainbow-me/rainbowkit/styles.css"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useTheme } from "next-themes"
import { http, WagmiProvider } from "wagmi"
import {
  arbitrumSepolia,
  baseSepolia,
  holesky,
  mantleSepoliaTestnet,
  polygonAmoy,
  sepolia,
  rootstockTestnet
} from "wagmi/chains"

import { APP_URL } from "@/app/config"
import { FULL_RPC_URLS } from "@/lib/viem-utils"

const mantleSepoliaWithLogo = {
  ...mantleSepoliaTestnet,
  iconUrl: "/mantle-logo.jpeg"
}

const amoyWithLogo = {
  ...polygonAmoy,
  iconUrl: "/polygon-logo.png"
}

const rootstockWithLogo = {
  ...rootstockTestnet,
  iconUrl: "/assets/rootstock.png"
}

const chains = [
  baseSepolia,
  mantleSepoliaWithLogo,
  holesky,
  amoyWithLogo,
  sepolia,
  arbitrumSepolia,
  rootstockWithLogo
] as const

const queryClient = new QueryClient()

const config = getDefaultConfig({
  appName: "Web3 GPT",
  appDescription: "Write and deploy smart contracts with AI",
  appUrl: APP_URL,
  appIcon: "/favicon.ico",
  projectId: `${process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID}`,
  chains: chains,
  transports: {
    [sepolia.id]: http(FULL_RPC_URLS[sepolia.id]),
    [polygonAmoy.id]: http(FULL_RPC_URLS[amoyWithLogo.id]),
    [baseSepolia.id]: http(FULL_RPC_URLS[baseSepolia.id]),
    [arbitrumSepolia.id]: http(FULL_RPC_URLS[arbitrumSepolia.id]),
    [mantleSepoliaTestnet.id]: http(),
    [holesky.id]: http(),
    [rootstockTestnet.id]: http()
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
