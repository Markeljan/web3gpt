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
  connectors: connectorsForWallets(
    [
      {
        groupName: "Recommended",
        wallets: [baseAccount, metaMaskWallet, rainbowWallet, walletConnectWallet, injectedWallet, safeWallet],
      },
    ],
    {
      appDescription: "Write and deploy Solidity smart contracts with AI",
      appIcon: "/assets/web3gpt.png",
      appName: "Web3GPT",
      appUrl: APP_URL,
      projectId: WALLETCONNECT_PROJECT_ID,
    }
  ),
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  transports: viemTransports,
})
