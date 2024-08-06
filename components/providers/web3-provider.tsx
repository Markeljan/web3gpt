"use client"

import { darkTheme, getDefaultConfig, lightTheme, RainbowKitProvider, type Wallet } from "@rainbow-me/rainbowkit"
import "@rainbow-me/rainbowkit/styles.css"
import {
  coinbaseWallet,
  injectedWallet,
  metaMaskWallet,
  rainbowWallet,
  safeWallet,
  walletConnectWallet
} from "@rainbow-me/rainbowkit/wallets"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useTheme } from "next-themes"
import { http, WagmiProvider } from "wagmi"
import {
  arbitrumSepolia,
  baseSepolia,
  holesky,
  mantleSepoliaTestnet,
  polygonAmoy,
  rootstockTestnet,
  sepolia
} from "wagmi/chains"
import { safe } from "wagmi/connectors"

import { APP_URL } from "@/lib/config"
import { FULL_RPC_URLS } from "@/lib/viem"

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
  arbitrumSepolia,
  baseSepolia,
  mantleSepoliaWithLogo,
  holesky,
  amoyWithLogo,
  sepolia,
  rootstockWithLogo
] as const

const queryClient = new QueryClient()

const safeWalletObject = safeWallet()

safeWalletObject.createConnector = () =>
  safe({
    // app.safe.global and *.blockscout.com
    allowedDomains: [/^app\.safe\.global$/, /^.*\.blockscout\.com$/]
  })

const customSafeWallet: () => Wallet = () => safeWalletObject

const config = getDefaultConfig({
  appName: "Web3GPT",
  appDescription: "Write and deploy Solidity smart contracts with AI",
  appUrl: APP_URL,
  appIcon: "/assets/web3gpt.png",
  projectId: `${process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID}`,
  chains: chains,
  transports: {
    [arbitrumSepolia.id]: http(FULL_RPC_URLS[arbitrumSepolia.id]),
    [sepolia.id]: http(FULL_RPC_URLS[sepolia.id]),
    [polygonAmoy.id]: http(FULL_RPC_URLS[amoyWithLogo.id]),
    [baseSepolia.id]: http(FULL_RPC_URLS[baseSepolia.id]),
    [mantleSepoliaTestnet.id]: http(),
    [holesky.id]: http(),
    [rootstockTestnet.id]: http()
  },
  wallets: [
    {
      groupName: "Supported",
      wallets: [customSafeWallet, metaMaskWallet, rainbowWallet, coinbaseWallet, walletConnectWallet, injectedWallet]
    }
  ],
  ssr: true
})

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme()

  return (
    <WagmiProvider config={config}>
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
            learnMoreUrl: "https://x.com/web3gpt_app"
          }}
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
