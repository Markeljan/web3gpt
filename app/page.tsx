import { auth } from "@/auth"
import { Chat } from "@/components/chat/chat"
import { getAgent } from "@/lib/data/kv"
import type { NextPageProps } from "@/lib/types"

export default async function ChatPage({ searchParams }: NextPageProps) {
  const agentId = searchParams?.a as string
  const agent = (agentId && (await getAgent(agentId))) || undefined
  const session = await auth()
  const { id, image } = session?.user || {}

  return <Chat agent={agent} userId={id} avatarUrl={image} />
}
