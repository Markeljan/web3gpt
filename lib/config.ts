import { arbitrumSepolia } from "viem/chains"

import type { Agent, GlobalConfig } from "@/lib/types"
import { getAgent } from "./actions/db"

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
    id: "asst_Tgzrzv0VaSgTRMn8ufAULlZG",
    userId: "12901349",
    name: "Web3GPT",
    description: "Develop smart contracts",
    creator: "soko.eth",
    imageUrl: "/assets/web3gpt.png"
  },
  {
    id: "asst_mv5KGoBLhXXQFiJHpgnopGQQ",
    userId: "12901349",
    name: "Unstoppable Domains",
    description: "Resolve cryptocurrency addresses to domains and vice versa",
    creator: "soko.eth",
    imageUrl: "https://docs.unstoppabledomains.com/images/logo.png"
  },
  {
    name: "OpenZeppelin 5.0",
    userId: "12901349",
    creator: "soko.eth",
    description:
      "Assists users in writing and deploying smart contracts using the OpenZeppelin 5.0 libraries, incorporating the latest features and best practices.",
    id: "asst_s66Y7GSbtkCLHMWKylSjqO7g",
    imageUrl: "https://www.openzeppelin.com/hubfs/oz-iso.svg"
  },
  {
    name: "CTF Agent",
    userId: "12901349",
    creator: "soko.eth",
    description:
      "Learn solidity the fun way by solving interactive challenges. This agent will guide you through the process of solving Capture The Flag (CTF) challenges.",
    id: "asst_GfjkcVcwAXzkNE1JBXNfe89q",
    imageUrl:
      "https://media.licdn.com/dms/image/D5612AQEMTmdASEpqog/article-cover_image-shrink_720_1280/0/1680103178404?e=2147483647&v=beta&t=J6hdKmr-VKTqTyLzO2FR10_mJTdAxzU4QWTQiRrv2fs"
  },
  {
    id: "asst_q1i7mHlBuAbDSrpDQk9f3Egm",
    userId: "12901349",
    name: "Creator",
    description: "Create your own AI agent",
    creator: "soko.eth",
    imageUrl: "/assets/agent-factory.png"
  }
]
