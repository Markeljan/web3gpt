import { baseSepolia } from "viem/chains"

import type { Agent } from "@/lib/types"
import type { GlobalConfig } from "@/lib/functions/types"

export const IS_PRODUCTION = process.env.NODE_ENV === "production"

export const APP_URL = IS_PRODUCTION ? (process.env.NEXT_PUBLIC_APP_URL as string) : "http://localhost:3000"
export const IPFS_GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://gateway.pinata.cloud"

export const DEFAULT_GLOBAL_CONFIG: GlobalConfig = {
  viemChain: baseSepolia,
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
