import type { Chain } from "viem"
import * as allViemChains from "viem/chains"

import { blockscoutUrls } from "@/lib/blockscout"

export function getChainById(chainId: number) {
  for (const chain of Object.values(allViemChains)) {
    if (chain.id === chainId) {
      return chain
    }
  }

  throw new Error(`Chain with id ${chainId} not found`)
}

export const FULL_RPC_URLS: Record<Chain["id"], string> = {
  11155111: `https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
  80002: `https://polygon-amoy.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
  84532: `https://base-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
  421614: `https://arb-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
}

export const EXPLORER_API_URLS: Record<Chain["id"], string> = {
  11155111: "https://api-sepolia.etherscan.io/api",
  80002: "https://api-amoy.polygonscan.com/api",
  84532: "https://api-sepolia.basescan.org/api",
  1: "https://api.etherscan.io/api",
  17000: "https://api-holesky.etherscan.io/api",
  420: "https://api-goerli.optimistic.etherscan.io/api",
  5003: "https://explorer.sepolia.mantle.xyz/api",
  421614: "https://api-sepolia.arbiscan.io/api"
}

export const EXPLORER_API_KEYS: Record<Chain["id"], string> = {
  11155111: `${process.env.ETHEREUM_EXPLORER_API_KEY}`,
  80002: `${process.env.POLYGON_EXPLORER_API_KEY}`,
  84532: `${process.env.BASE_EXPLORER_API_KEY}`,
  1: `${process.env.ETHEREUM_EXPLORER_API_KEY}`,
  17000: `${process.env.ETHEREUM_EXPLORER_API_KEY}`,
  420: `${process.env.OPTIMISM_EXPLORER_API_KEY}`,
  5003: `${process.env.MANTLE_EXPLORER_API_KEY}`,
  421614: `${process.env.ARBITRUM_EXPLORER_API_KEY}`
}

type ExplorerDetails = {
  url: string
  apiUrl: string
  apiKey: string
}

export const getExplorerDetails = (viemChain: Chain): ExplorerDetails => {
  const blockscoutUrl = blockscoutUrls[viemChain.id]
  if (blockscoutUrl) {
    return {
      url: `${blockscoutUrl}`,
      apiUrl: `${blockscoutUrl}/api`,
      apiKey: `${process.env.BLOCKSCOUT_API_KEY}`
    }
  }

  const viemExplorerUrl = viemChain.blockExplorers?.default.url
  const viemApiUrl = EXPLORER_API_URLS[viemChain.id]
  const viemApiKey = EXPLORER_API_KEYS[viemChain.id]
  if (viemExplorerUrl && viemApiUrl && viemApiKey) {
    return {
      url: viemExplorerUrl,
      apiUrl: viemApiUrl,
      apiKey: viemApiKey
    }
  }

  throw new Error(`Unsupported chain or explorer api.  Network: ${viemChain.name} ChainId: ${viemChain.id}`)
}
