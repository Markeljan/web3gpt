import type { Chain } from "viem"
import { type CreateConnectorFn, cookieStorage, createConfig, createStorage } from "wagmi"
import { BLOCKSCOUT_URLS } from "@/lib/blockscout"
import { RPC_URLS, SUPPORTED_CHAINS, viemTransports } from "@/lib/constants"
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

  return {
    rpcUrl: RPC_URLS[chainId] || viemChain.rpcUrls.default.http[0],
    explorerUrl: blockscoutUrl || etherscan?.explorerUrl || viemChain.blockExplorers?.default.url || "",
    explorerApiUrl: blockscoutUrl
      ? buildApiUrl(blockscoutUrl)
      : etherscan?.apiUrl || viemChain.blockExplorers?.default.apiUrl || "",
    explorerApiKey: blockscoutUrl
      ? process.env.NEXT_PUBLIC_BLOCKSCOUT_API_KEY || ""
      : process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || "",
  }
}

export function getChainById(chainId: number): ChainWithIcon | null {
  return SUPPORTED_CHAINS.find((chain) => chain.id === chainId) || null
}

export const getWagmiConfig = (connectors?: CreateConnectorFn[]) =>
  createConfig({
    chains: SUPPORTED_CHAINS,
    transports: viemTransports,
    ssr: true,
    storage: createStorage({
      storage: cookieStorage,
    }),
    connectors,
  })
