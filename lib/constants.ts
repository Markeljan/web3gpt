import { http } from "viem"
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
import type { Agent, ChainWithIcon } from "@/lib/types"

export const DEFAULT_AGENT_ID = "asst_Tgzrzv0VaSgTRMn8ufAULlZG"
export const TOKENSCRIPT_AGENT_ID = "asst_13kX3wWTUa7Gz9jvFOqnnA77"

export const DEFAULT_AGENT: Agent = {
  id: DEFAULT_AGENT_ID,
  userId: "12901349",
  name: "Web3GPT",
  description: "Develop smart contracts",
  creator: "soko.eth",
  imageUrl: "/assets/web3gpt.png",
}

export const DEFAULT_COMPILER_VERSION = "v0.8.29+commit.ab55807c"

export const RPC_URLS: Record<number, string> = {
  [sepolia.id]: `https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
  [polygonAmoy.id]: `https://polygon-amoy.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
  [baseSepolia.id]: `https://base-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
  [arbitrumSepolia.id]: `https://arb-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
  [optimismSepolia.id]: `https://opt-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
  [celoAlfajores.id]: `https://celo-alfajores.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
  [mantleSepoliaTestnet.id]: `https://mantle-sepolia.gateway.tenderly.co/${process.env.NEXT_PUBLIC_TENDERLY_API_KEY}`,
  [metisSepolia.id]: `https://metis-sepolia.gateway.tenderly.co/${process.env.NEXT_PUBLIC_TENDERLY_API_KEY}`,
}

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

export const viemTransports = Object.fromEntries(
  SUPPORTED_CHAINS.map((chain) => [[chain.id], http(RPC_URLS[chain.id])])
)

export const AGENTS_ARRAY: Agent[] = [
  {
    id: "asst_FiWv3gKSXZyKGnuJdSZvpf6V",
    userId: "12901349",
    name: "GENT",
    description: "first token agent launched on W3GPT",
    creator: "soko.eth",
    imageUrl: "https://ipfs.w3gpt.ai/ipfs/bafkreidmmwgfagx34nj4oy34her2tmcgp5deybs72ymy4edi4ye3nyfulu",
  },
  {
    id: "asst_V9jrE4PX6j3ZDNNbzyLcOIm2",
    userId: "12901349",
    name: "x420",
    description:
      "The chillest AI agent on w3gpt.ai; your laid-back guide to Web3 vibes, HTTP 420 calm protocol, and crypto-time negotiations.",
    creator: "soko.eth",
    imageUrl: "https://lvjt7wkmlmpwhrpm.public.blob.vercel-storage.com/logo-upscaled.png",
  },
  DEFAULT_AGENT,
  {
    name: "OpenZeppelin 5.0",
    userId: "12901349",
    creator: "soko.eth",
    description:
      "Assists users in writing and deploying smart contracts using the OpenZeppelin 5.0 libraries, incorporating the latest features and best practices.",
    id: "asst_s66Y7GSbtkCLHMWKylSjqO7g",
    imageUrl: "https://www.openzeppelin.com/hubfs/oz-iso.svg",
  },
  {
    name: "CTF Agent",
    userId: "12901349",
    creator: "soko.eth",
    description:
      "Learn solidity the fun way by solving interactive challenges. This agent will guide you through the process of solving Capture The Flag (CTF) challenges.",
    id: "asst_GfjkcVcwAXzkNE1JBXNfe89q",
    imageUrl:
      "https://media.licdn.com/dms/image/D5612AQEMTmdASEpqog/article-cover_image-shrink_720_1280/0/1680103178404?e=2147483647&v=beta&t=J6hdKmr-VKTqTyLzO2FR10_mJTdAxzU4QWTQiRrv2fs",
  },
  {
    id: "asst_q1i7mHlBuAbDSrpDQk9f3Egm",
    userId: "12901349",
    name: "Creator",
    description: "Create your own AI agent",
    creator: "soko.eth",
    imageUrl: "/assets/agent-factory.png",
  },
]

export const IPFS_W3GPT_GROUP_ID = "ded75ff6-65b1-43a2-bf95-6adc538828f9"
