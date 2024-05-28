import type { Message } from "ai"

export type ChatPageProps = {
  params: { id: string }
  searchParams?: { [key: string]: string | string[] | undefined }
}

export type DbChat = {
  id: string
  agentId: string
  title: string
  createdAt: number
  userId: string
  messages: Message[]
  published: boolean
  avatarUrl?: string | null
}

export type DbChatListItem = {
  id: string
  agentId: string
  createdAt: number
  title: string
  userId: string
  published: boolean
}

export type ServerActionResult<Result> = Promise<
  | Result
  | {
      error: string
    }
>

export type Agent = {
  id: string
  userId: string
  name: string
  description: string
  imageUrl: string
  creator: string
}
