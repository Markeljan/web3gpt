"use client"

import { connectorsForWallets } from "@rainbow-me/rainbowkit"
import {
  baseAccount,
  injectedWallet,
  metaMaskWallet,
  rainbowWallet,
  safeWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets"
import { cookieStorage, createConfig, createStorage } from "wagmi"
import { APP_URL, WALLETCONNECT_PROJECT_ID } from "@/lib/config"
import { SUPPORTED_CHAINS, viemTransports } from "@/lib/constants"

export const wagmiConfig = createConfig({
  chains: SUPPORTED_CHAINS,
  transports: viemTransports,
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  connectors: connectorsForWallets(
    [
      {
        groupName: "Recommended",
        wallets: [baseAccount, metaMaskWallet, rainbowWallet, walletConnectWallet, injectedWallet, safeWallet],
      },
    ],
    {
      appName: "Web3GPT",
      appDescription: "Write and deploy Solidity smart contracts with AI",
      appUrl: APP_URL,
      appIcon: "/assets/web3gpt.png",
      projectId: WALLETCONNECT_PROJECT_ID,
    }
  ),
})
