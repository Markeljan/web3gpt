import type { Message } from "ai"

type ChatValue = string | null | undefined

export type Chat = Record<string, ChatValue> & {
  id: string
  title: string
  createdAt: Date
  userId: string
  path: string
  messages: Message[]
  sharePath?: string
}

export type ChatListItem = {
  id: string
  createdAt: Date
  title: string
  userId: string
  path: string
  sharePath?: string
}

export type ServerActionResult<Result> = Promise<
  | Result
  | {
      error: string
    }
>

export type ChainData = {
  name: string
  chain: string
  icon?: string
  rpc: string[]
  features?: { name: string }[]
  faucets: string[]
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  infoURL: string
  shortName: string
  chainId: number
  networkId: number
  slip44?: number
  ens?: {
    registry: string
  }
  explorers?: {
    name: string
    url: string
    standard?: string
    icon?: string
  }[]
}
