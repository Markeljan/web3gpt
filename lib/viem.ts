import type { Chain } from "viem"

import { BLOCKSCOUT_URLS } from "@/lib/blockscout"
import { chains } from "@/lib/config"

const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || ""
const etherscanApiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || ""
const polygonscanApiKey = process.env.NEXT_PUBLIC_POLYGONSCAN_API_KEY || ""
const basescanApiKey = process.env.NEXT_PUBLIC_BASESCAN_API_KEY || ""
const mantleApiKey = process.env.NEXT_PUBLIC_MANTLE_API_KEY || ""
const arbitrumApiKey = process.env.NEXT_PUBLIC_ARBITRUM_API_KEY || ""
const optimismApiKey = process.env.NEXT_PUBLIC_OPTIMISM_API_KEY || ""
const blockscoutApiKey = process.env.NEXT_PUBLIC_BLOCKSCOUT_API_KEY || ""

export const EXPLORER_API_URLS: Record<number, string> = {
  11155420: "https://api-sepolia-optimistic.etherscan.io/api",
  11155111: "https://api-sepolia.etherscan.io/api",
  80002: "https://api-amoy.polygonscan.com/api",
  84532: "https://api-sepolia.basescan.org/api",
  5003: "https://explorer.sepolia.mantle.xyz/api",
  421614: "https://api-sepolia.arbiscan.io/api"
}

export const EXPLORER_API_KEYS: Record<number, string> = {
  11155420: optimismApiKey,
  11155111: etherscanApiKey,
  80002: polygonscanApiKey,
  84532: basescanApiKey,
  5003: mantleApiKey,
  421614: arbitrumApiKey
}

export const FULL_RPC_URLS: Record<number, string> = {
  11155420: `https://opt-sepolia.g.alchemy.com/v2/${alchemyApiKey}`,
  11155111: `https://eth-sepolia.g.alchemy.com/v2/${alchemyApiKey}`,
  80002: `https://polygon-amoy.g.alchemy.com/v2/${alchemyApiKey}`,
  84532: `https://base-sepolia.g.alchemy.com/v2/${alchemyApiKey}`,
  5003: `https://mantle-sepolia.g.alchemy.com/v2/${alchemyApiKey}`,
  421614: `https://arb-sepolia.g.alchemy.com/v2/${alchemyApiKey}`
}

type ExplorerDetails = {
  url: string
  apiUrl: string
  apiKey: string
}

export const getExplorerDetails = (viemChain: Chain): ExplorerDetails => {
  const blockscoutUrl = BLOCKSCOUT_URLS[viemChain.id]

  if (blockscoutUrl) {
    return {
      url: blockscoutUrl,
      apiUrl: `${blockscoutUrl}/api`,
      apiKey: blockscoutApiKey
    }
  }

  const viemExplorerUrl = viemChain.blockExplorers?.default.url
  const viemApiUrl = EXPLORER_API_URLS?.[viemChain.id]
  const viemApiKey = EXPLORER_API_KEYS?.[viemChain.id]

  if (!viemExplorerUrl || !viemApiUrl || !viemApiKey) {
    throw new Error("No explorer details found for chain")
  }

  return {
    url: viemExplorerUrl,
    apiUrl: viemApiUrl,
    apiKey: viemApiKey
  }
}

export function getChainById(chainId: number) {
  return chains.find((chain) => chain.id === chainId)
}
