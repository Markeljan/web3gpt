"use client"

import { darkTheme, lightTheme, RainbowKitProvider, type Theme } from "@rainbow-me/rainbowkit"
import { wagmiConfig } from "@/lib/wagmi-config"
import "@rainbow-me/rainbowkit/styles.css"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useTheme } from "next-themes"
import { useEffect, useMemo, useState } from "react"
import { cookieToInitialState, WagmiProvider } from "wagmi"

export function Web3Provider({
  children,
  cookiesValue,
}: {
  children: React.ReactNode
  cookiesValue?: string | undefined
}) {
  const [queryClient] = useState(() => new QueryClient())
  const [rainbowKitTheme, setRainbowKitTheme] = useState<Theme | undefined>(undefined)
  const { theme } = useTheme()
  const initialState = useMemo(() => cookieToInitialState(wagmiConfig, cookiesValue), [cookiesValue])

  useEffect(() => {
    const getRainbowKitTheme = () => {
      switch (theme) {
        case "system":
          return {
            lightMode: lightTheme({
              accentColor: "#21C55E",
              accentColorForeground: "white",
            }),
            darkMode: darkTheme({
              accentColor: "#21C55E",
              accentColorForeground: "black",
            }),
          }
        case "dark":
          return darkTheme({
            accentColor: "#21C55E",
            accentColorForeground: "black",
          })
        default:
          return lightTheme({
            accentColor: "#21C55E",
            accentColorForeground: "white",
          })
      }
    }
    setRainbowKitTheme(getRainbowKitTheme())
  }, [theme])

  return (
    <WagmiProvider config={wagmiConfig} initialState={initialState} reconnectOnMount={true}>
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
          theme={rainbowKitTheme}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
