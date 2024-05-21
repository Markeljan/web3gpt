import type { Message } from "ai"

type ImageFileContentBlock = {
  image_file: {
    file_id: string

    detail?: "auto" | "low" | "high"
  }
  type: "image_file"
}

type ImageURLContentBlock = {
  image_url: {
    url: string
    detail?: "auto" | "low" | "high"
  }
  type: "image_url"
}

type TextContentBlock = {
  // biome-ignore lint/complexity/noBannedTypes: <explanation>
  text: { annotations: Array<Object>; value: string }
  type: "text"
}
export type MessageContent = ImageFileContentBlock | ImageURLContentBlock | TextContentBlock
export type OpenAIThreadMessage = {
  id: string
  assistant_id: string | null
  // biome-ignore lint/complexity/noBannedTypes: <explanation>
  attachments: Array<Object> | null
  completed_at: number | null
  content: Array<MessageContent>
  created_at: number
  incomplete_at: number | null
  // biome-ignore lint/complexity/noBannedTypes: <explanation>
  incomplete_details: Object | null
  metadata: unknown | null
  object: "thread.message"
  role: "user" | "assistant"
  run_id: string | null
  status: "in_progress" | "incomplete" | "completed"
  thread_id: string
}

export type DbChat = {
  id: string
  agentId: string
  title: string
  createdAt: Date
  userId: number
  messages: Message[]
  published: boolean
  avatarUrl?: string | null
}

export type DbChatListItem = {
  id: string
  agentId: string
  createdAt: Date
  title: string
  userId: number
  published: boolean
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

export type Agent = {
  id: string
  userId: number
  name: string
  description: string
  imageUrl: string
  creator: string
}
