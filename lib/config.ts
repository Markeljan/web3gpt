import { arbitrumSepolia } from "viem/chains"

import type { Agent, GlobalConfig } from "@/lib/types"

export const IS_PRODUCTION = process.env.NODE_ENV === "production"

export const APP_URL = IS_PRODUCTION ? (process.env.NEXT_PUBLIC_APP_URL as string) : "http://localhost:3000"
export const IPFS_GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://gateway.pinata.cloud"

export const DEFAULT_GLOBAL_CONFIG: GlobalConfig = {
  viemChain: arbitrumSepolia,
  compilerVersion: "v0.8.26+commit.8a97fa7a",
  useWallet: false
}

export const DEFAULT_AGENT: Agent = {
  id: "asst_Tgzrzv0VaSgTRMn8ufAULlZG",
  userId: "12901349",
  name: "Web3GPT",
  description: "Develop smart contracts",
  creator: "soko.eth",
  imageUrl: "/assets/web3gpt.png"
}

export const AGENTS_ARRAY: Agent[] = [
  {
    id: "asst_We6a5t8B5F5uCOPMadM92hCT",
    userId: "12901349",
    name: "ERC20",
    description: "Develop ERC20 token contracts",
    creator: "soko.eth",
    imageUrl: "/assets/erc20.png"
  },
  {
    id: "asst_c5RLL0wfNkyBQJ5zLmmpHFDh",
    userId: "12901349",
    name: "ERC721",
    description: "ERC721 NFT contract wizard",
    creator: "soko.eth",
    imageUrl: "/assets/erc721.png"
  },
  {
    id: "asst_Tgzrzv0VaSgTRMn8ufAULlZG",
    userId: "12901349",
    name: "Web3GPT",
    description: "Develop smart contracts",
    creator: "soko.eth",
    imageUrl: "/assets/web3gpt.png"
  },
  {
    id: "asst_q1i7mHlBuAbDSrpDQk9f3Egm",
    userId: "12901349",
    name: "Creator",
    description: "Create your own AI agent",
    creator: "soko.eth",
    imageUrl: "/assets/agent-factory.png"
  },
  {
    id: "asst_mv5KGoBLhXXQFiJHpgnopGQQ",
    userId: "12901349",
    name: "Unstoppable Domains",
    description: "Resolve cryptocurrency addresses to domains and vice versa",
    creator: "soko.eth",
    imageUrl: "https://docs.unstoppabledomains.com/images/logo.png"
  }
]
