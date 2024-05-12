import { holesky } from "viem/chains"
import type { GlobalConfig } from "@/lib/functions/types"
import type { Agent } from "./types"

export const APP_URL = process.env.NEXTAUTH_URL
export const W3GPT_API_SECRET = process.env.W3GPT_API_SECRET

export const DEFAULT_GLOBAL_CONFIG: GlobalConfig = {
  viemChain: holesky,
  compilerVersion: "v0.8.25+commit.b61c2a91",
  useWallet: false
}

//
export const DEFAULT_AGENT: Agent = {
  id: "asst_Tgzrzv0VaSgTRMn8ufAULlZG",
  name: "W3GPT",
  description: "Develop smart contracts",
  creator: "soko.eth",
  imageUrl: "/assets/w3gpt.webp"
}

export const AGENTS_ARRAY = [
  {
    id: "asst_We6a5t8B5F5uCOPMadM92hCT",
    name: "ERC20",
    description: "Develop ERC20 token contracts",
    creator: "soko.eth",
    imageUrl: "/assets/erc20.webp"
  },
  {
    id: "asst_c5RLL0wfNkyBQJ5zLmmpHFDh",
    name: "ERC721",
    description: "ERC721 NFT contract wizard",
    creator: "soko.eth",
    imageUrl: "/assets/erc721.webp"
  },
  {
    id: "asst_Tgzrzv0VaSgTRMn8ufAULlZG",
    name: "W3GPT",
    description: "Develop smart contracts",
    creator: "soko.eth",
    imageUrl: "/assets/w3gpt.webp"
  },
  {
    id: "asst_q1i7mHlBuAbDSrpDQk9f3Egm",
    name: "Creator",
    description: "Create your own AI agent",
    creator: "soko.eth",
    imageUrl: "/assets/agent-factory.webp"
  }
]
