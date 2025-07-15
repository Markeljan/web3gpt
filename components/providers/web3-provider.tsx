"use client"

import { darkTheme, lightTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit"
import { useState } from "react"
import "@rainbow-me/rainbowkit/styles.css"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useTheme } from "next-themes"
import { type State, WagmiProvider } from "wagmi"

import { getWagmiConfig } from "@/lib/config"
import { connectors } from "@/lib/rainbowkit"

export function Web3Provider({
  children,
  initialState,
}: {
  children: React.ReactNode
  initialState: State | undefined
}) {
  const { resolvedTheme } = useTheme()
  const [config] = useState(() => getWagmiConfig(connectors))
  const [queryClient] = useState(() => new QueryClient())

  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          key="wagmi"
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
