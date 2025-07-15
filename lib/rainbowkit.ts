"use client"

import { connectorsForWallets } from "@rainbow-me/rainbowkit"
import {
  injectedWallet,
  metaMaskWallet,
  rainbowWallet,
  safeWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets"

import { DEPLOYMENT_URL } from "@/lib/config"

export const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [rainbowWallet, walletConnectWallet, metaMaskWallet, injectedWallet, safeWallet],
    },
  ],
  {
    appName: "Web3GPT",
    appDescription: "Write and deploy Solidity smart contracts with AI",
    appUrl: DEPLOYMENT_URL,
    appIcon: "/assets/web3gpt.png",
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  },
)
