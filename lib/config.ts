import type { Chain } from "viem"
import {
  arbitrumSepolia,
  baseSepolia,
  celoAlfajores,
  mantleSepoliaTestnet,
  metisSepolia,
  optimismSepolia,
  polygonAmoy,
  sepolia,
} from "viem/chains"
import { http, type CreateConnectorFn, cookieStorage, createConfig, createStorage } from "wagmi"

import { BLOCKSCOUT_URLS } from "@/lib/blockscout"
import { ETHERSCAN_V2_URLS } from "@/lib/etherscan"
import type { ChainDetails, ChainWithIcon } from "@/lib/types"
import { DEPLOYMENT_URL as VERCEL_DEPLOYMENT_URL } from "vercel-url"

const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY
const BLOCKSCOUT_API_KEY = process.env.NEXT_PUBLIC_BLOCKSCOUT_API_KEY
const ETHERSCAN_API_KEY = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY
const TENDERLY_API_KEY = process.env.NEXT_PUBLIC_TENDERLY_API_KEY

export const DEPLOYMENT_URL = VERCEL_DEPLOYMENT_URL || "https://w3gpt.ai"
export const DEFAULT_COMPILER_VERSION = "v0.8.29+commit.ab55807c"

const metisSepoliaWithIcon = {
  ...metisSepolia,
  rpcUrls: {
    default: {
      http: [
        "https://sepolia.metisdevops.link",
        "https://metis-sepolia-rpc.publicnode.com",
        "https://metis-sepolia.gateway.tenderly.co",
      ],
      webSocket: ["wss://metis-sepolia-rpc.publicnode.com"],
    },
  },
  iconUrl: "/assets/metis-logo.png",
  iconBackground: "#0099FF",
}

const mantleSepoliaWithIcon = {
  ...mantleSepoliaTestnet,
  name: "Mantle Sepolia",
  iconUrl: "/assets/chains/mantle-logo.png",
  iconBackground: "#000000",
}
const polygonAmoyWithIcon = {
  ...polygonAmoy,
  iconUrl: "/assets/chains/polygon-logo.png",
  iconBackground: "#8247E5",
}

const baseSepoliaWithIcon = {
  ...baseSepolia,
  iconUrl: "/assets/chains/base-logo.png",
  iconBackground: "#0052FF",
}

const arbitrumSepoliaWithIcon = {
  ...arbitrumSepolia,
  iconUrl: "/assets/chains/arbitrum-logo.png",
  iconBackground: "#2D374B",
}

const optimismSepoliaWithIcon = {
  ...optimismSepolia,
  iconUrl: "/assets/chains/optimism-logo.png",
  iconBackground: "#FF0420",
}

const celoAlfajoresWithIcon = {
  ...celoAlfajores,
  iconUrl: "/assets/chains/celo-logo.png",
  iconBackground: "#35D07F",
}

const sepoliaWithIcon = {
  ...sepolia,
  iconUrl: "/assets/chains/ethereum-logo.png",
  iconBackground: "#FFFFFF10",
}

export const SUPPORTED_CHAINS: [ChainWithIcon, ...ChainWithIcon[]] = [
  polygonAmoyWithIcon,
  metisSepoliaWithIcon,
  mantleSepoliaWithIcon,
  baseSepoliaWithIcon,
  arbitrumSepoliaWithIcon,
  optimismSepoliaWithIcon,
  celoAlfajoresWithIcon,
  sepoliaWithIcon,
]

export const RPC_URLS: Record<number, string> = {
  [sepolia.id]: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  [polygonAmoy.id]: `https://polygon-amoy.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  [baseSepolia.id]: `https://base-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  [arbitrumSepolia.id]: `https://arb-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  [optimismSepolia.id]: `https://opt-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  [celoAlfajores.id]: `https://celo-alfajores.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  [mantleSepoliaTestnet.id]: `https://mantle-sepolia.gateway.tenderly.co/${TENDERLY_API_KEY}`,
  [metisSepolia.id]: `https://metis-sepolia.gateway.tenderly.co/${TENDERLY_API_KEY}`,
}

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
    explorerApiKey: blockscoutUrl ? BLOCKSCOUT_API_KEY : ETHERSCAN_API_KEY,
  }
}

export function getChainById(chainId: number): ChainWithIcon | null {
  return SUPPORTED_CHAINS.find((chain) => chain.id === chainId) || null
}

export function getWagmiConfig(connectors?: CreateConnectorFn[]) {
  return createConfig({
    chains: SUPPORTED_CHAINS,
    transports: Object.fromEntries(SUPPORTED_CHAINS.map((chain) => [[chain.id], http(RPC_URLS[chain.id])])),
    ssr: true,
    storage: createStorage({
      storage: cookieStorage,
    }),
    connectors,
  })
}
