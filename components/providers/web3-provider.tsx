'use client'

import '@rainbow-me/rainbowkit/styles.css'
import {
  darkTheme,
  getDefaultWallets,
  lightTheme,
  RainbowKitProvider
} from '@rainbow-me/rainbowkit'
import { configureChains, createConfig, WagmiConfig } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import {
  arbitrumGoerli,
  baseGoerli,
  goerli,
  polygonMumbai,
  sepolia
} from 'wagmi/chains'
import { useTheme } from 'next-themes'

const { chains, publicClient } = configureChains(
  [arbitrumGoerli, baseGoerli, goerli, polygonMumbai, sepolia],
  [
    alchemyProvider({ apiKey: `${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}` }),
    publicProvider()
  ]
)

const { connectors } = getDefaultWallets({
  appName: 'Web3 GPT',
  projectId: `${process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID}`,
  chains
})

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient
})

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme()

  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider
        chains={chains}
        initialChain={baseGoerli}
        theme={
          resolvedTheme === 'dark'
            ? darkTheme({
                accentColor: '#21C55E',
                accentColorForeground: 'black'
              })
            : lightTheme({
                accentColor: '#21C55E',
                accentColorForeground: 'white'
              })
        }
      >
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  )
}
