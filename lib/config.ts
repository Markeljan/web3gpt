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
import type { ChainDetails, ChainWithIcon } from "@/lib/types"
import { DEPLOYMENT_URL as VERCEL_DEPLOYMENT_URL } from "vercel-url"

const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY
const BLOCKSCOUT_API_KEY = process.env.NEXT_PUBLIC_BLOCKSCOUT_API_KEY
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

export const CHAIN_DETAILS: Record<string, ChainDetails> = {
  [sepolia.id]: {
    rpcUrl: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    explorerUrl: "https://sepolia.etherscan.io",
    explorerApiUrl: "https://api-sepolia.etherscan.io/api",
    explorerApiKey: process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY,
  },
  [polygonAmoy.id]: {
    rpcUrl: `https://polygon-amoy.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    explorerUrl: "https://amoy.polygonscan.com",
    explorerApiUrl: "https://api-amoy.polygonscan.com/api",
    explorerApiKey: process.env.NEXT_PUBLIC_POLYGONSCAN_API_KEY,
  },
  [baseSepolia.id]: {
    rpcUrl: `https://base-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    explorerUrl: "https://sepolia.basescan.org",
    explorerApiUrl: "https://api-sepolia.basescan.org/api",
    explorerApiKey: process.env.NEXT_PUBLIC_BASESCAN_API_KEY,
  },
  [arbitrumSepolia.id]: {
    rpcUrl: `https://arb-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    explorerUrl: "https://sepolia.arbiscan.io",
    explorerApiUrl: "https://api-sepolia.arbiscan.io/api",
    explorerApiKey: process.env.NEXT_PUBLIC_ARBISCAN_API_KEY,
  },
  [optimismSepolia.id]: {
    rpcUrl: `https://opt-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    explorerUrl: "https://sepolia-optimism.etherscan.io",
    explorerApiUrl: "https://api-sepolia-optimistic.etherscan.io/api",
    explorerApiKey: process.env.NEXT_PUBLIC_OPSCAN_API_KEY,
  },
  [celoAlfajores.id]: {
    rpcUrl: `https://celo-alfajores.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    explorerUrl: "https://alfajores.celoscan.io",
    explorerApiUrl: "https://api-alfajores.celoscan.io/api",
    explorerApiKey: process.env.NEXT_PUBLIC_CELOSCAN_API_KEY,
  },
  [mantleSepoliaTestnet.id]: {
    rpcUrl: `https://mantle-sepolia.gateway.tenderly.co/${TENDERLY_API_KEY}`,
    explorerUrl: "https://sepolia.mantlescan.xyz/",
    explorerApiUrl: "https://api-sepolia.mantlescan.xyz/api",
    explorerApiKey: process.env.NEXT_PUBLIC_MANTLESCAN_API_KEY,
  },
  [metisSepolia.id]: {
    rpcUrl: `https://metis-sepolia.gateway.tenderly.co/${TENDERLY_API_KEY}`,
    explorerUrl: "https://sepolia-explorer.metisdevops.link",
    explorerApiUrl: "https://sepolia-explorer-api.metisdevops.link/api",
    explorerApiKey: BLOCKSCOUT_API_KEY,
  },
}

const buildApiUrl = (blockscoutUrl: string) => {
  if (blockscoutUrl === "https://sepolia-explorer.metisdevops.link") {
    return "https://sepolia-explorer-api.metisdevops.link/api"
  }
  return `${blockscoutUrl}/api`
}

export const getChainDetails = (viemChain: Chain): ChainDetails => {
  const chainId = viemChain.id
  const chainDetails = CHAIN_DETAILS[chainId]
  const blockscoutUrl = BLOCKSCOUT_URLS[chainId]

  return {
    rpcUrl: chainDetails.rpcUrl,
    explorerUrl: blockscoutUrl || chainDetails.explorerUrl || viemChain.blockExplorers?.default.url || "",
    explorerApiUrl: blockscoutUrl
      ? buildApiUrl(blockscoutUrl)
      : chainDetails.explorerApiUrl || viemChain.blockExplorers?.default.apiUrl || "",
    explorerApiKey: blockscoutUrl ? BLOCKSCOUT_API_KEY : chainDetails.explorerApiKey,
  }
}

export function getChainById(chainId: number): ChainWithIcon | null {
  return SUPPORTED_CHAINS.find((chain) => chain.id === chainId) || null
}

export function getWagmiConfig(connectors?: CreateConnectorFn[]) {
  return createConfig({
    chains: SUPPORTED_CHAINS,
    transports: Object.fromEntries(SUPPORTED_CHAINS.map((chain) => [[chain.id], http(CHAIN_DETAILS[chain.id].rpcUrl)])),
    ssr: true,
    storage: createStorage({
      storage: cookieStorage,
    }),
    connectors,
  })
}
