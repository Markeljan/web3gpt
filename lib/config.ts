import { DEPLOYMENT_URL } from "vercel-url"
import type { Chain } from "viem"
import { BLOCKSCOUT_URLS } from "@/lib/blockscout"
import { AGENT_DEPLOY_CHAINS, RPC_URLS } from "@/lib/constants"
import { ETHERSCAN_V2_URLS } from "@/lib/etherscan"
import type { ChainDetails, ChainWithIcon } from "@/lib/types"

const buildApiUrl = (blockscoutUrl: string) => {
  if (blockscoutUrl === "https://sepolia-explorer.metisdevops.link") {
    return "https://sepolia-explorer-api.metisdevops.link/api"
  }
  return `${blockscoutUrl}/api`
}

export const getChainDetails = (viemChain: Chain): ChainDetails => {
  const chainId = viemChain.id
  const blockscoutUrl = BLOCKSCOUT_URLS[chainId]
  const etherscan = ETHERSCAN_V2_URLS[chainId]
  const isBlockscout = Boolean(blockscoutUrl)
  const isEtherscan = Boolean(etherscan)
  let explorerType: ChainDetails["explorerType"] = "unknown"

  if (isBlockscout) {
    explorerType = "blockscout"
  } else if (isEtherscan) {
    explorerType = "etherscan"
  }

  return {
    rpcUrl: RPC_URLS[chainId] || viemChain.rpcUrls.default.http[0],
    explorerUrl: blockscoutUrl || etherscan?.explorerUrl || viemChain.blockExplorers?.default.url || "",
    explorerApiUrl: blockscoutUrl
      ? buildApiUrl(blockscoutUrl)
      : etherscan?.apiUrl || viemChain.blockExplorers?.default.apiUrl || "",
    explorerApiKey: isBlockscout
      ? process.env.BLOCKSCOUT_API_KEY || process.env.NEXT_PUBLIC_BLOCKSCOUT_API_KEY || ""
      : process.env.ETHERSCAN_API_KEY || process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || "",
    explorerType,
  }
}

export function getChainById(chainId: number): ChainWithIcon | null {
  return AGENT_DEPLOY_CHAINS.find((chain) => chain.id === chainId) || null
}

export const APP_URL = DEPLOYMENT_URL
export const WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ""
