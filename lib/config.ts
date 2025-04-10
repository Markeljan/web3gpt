import { DEPLOYMENT_URL } from "vercel-url"
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
import { cookieStorage, createConfig, createStorage, http, type CreateConnectorFn } from "wagmi"

import { BLOCKSCOUT_URLS } from "@/lib/blockscout"
import type { ChainDetails } from "@/lib/types"

const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY
const BLOCKSCOUT_API_KEY = process.env.NEXT_PUBLIC_BLOCKSCOUT_API_KEY

export const metisSepoliaWithIcon = {
  ...metisSepolia,
  iconUrl: "/assets/metis-logo.png",
}

export const APP_URL = DEPLOYMENT_URL
export const DEFAULT_COMPILER_VERSION = "v0.8.29+commit.ab55807c"
export const DEFAULT_CHAIN = metisSepoliaWithIcon

const mantleSepolia = {
  ...mantleSepoliaTestnet,
  name: "Mantle Sepolia",
  iconUrl: "/mantle-logo.jpeg",
}

const amoy = {
  ...polygonAmoy,
  iconUrl: "/polygon-logo.png",
}

export const supportedChains: [Chain, ...Chain[]] = [
  arbitrumSepolia,
  optimismSepolia,
  baseSepolia,
  metisSepolia,
  mantleSepolia,
  celoAlfajores,
  amoy,
  sepolia,
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
  [mantleSepolia.id]: {
    rpcUrl: `https://green-few-wish.mantle-sepolia.quiknode.pro/${process.env.NEXT_PUBLIC_QUICKNODE_API_KEY}`,
    explorerUrl: "https://sepolia.mantlescan.xyz/",
    explorerApiUrl: "https://api-sepolia.mantlescan.xyz/api",
    explorerApiKey: process.env.NEXT_PUBLIC_MANTLESCAN_API_KEY,
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
  [metisSepolia.id]: {
    rpcUrl: "https://sepolia.metisdevops.link",
    explorerUrl: "https://sepolia-explorer.metisdevops.link",
    explorerApiUrl: "https://sepolia-explorer-api.metisdevops.link/api",
    explorerApiKey: BLOCKSCOUT_API_KEY,
  },
  [celoAlfajores.id]: {
    rpcUrl: "https://alfajores-forno.celo-testnet.org",
    explorerUrl: "https://alfajores.celoscan.io",
    explorerApiUrl: "https://api-alfajores.celoscan.io/api",
    explorerApiKey: process.env.NEXT_PUBLIC_CELOSCAN_API_KEY,
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

export function getChainById(chainId: number): Chain | null {
  return supportedChains.find((chain) => chain.id === chainId) || null
}

export function getWagmiConfig(connectors?: CreateConnectorFn[]) {
  return createConfig({
    chains: supportedChains,
    transports: Object.fromEntries(supportedChains.map((chain) => [[chain.id], http(CHAIN_DETAILS[chain.id].rpcUrl)])),
    ssr: true,
    storage: createStorage({
      storage: cookieStorage,
    }),
    connectors,
  })
}
