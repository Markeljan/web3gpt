import { auth } from "@/auth"
import { Chat } from "@/components/chat/chat"
import { DEFAULT_AGENT } from "@/lib/constants"
import { getAgent } from "@/lib/data/kv"
import type { NextPageProps } from "@/lib/types"

export default async function ChatPage({ searchParams }: NextPageProps) {
  const agentIdParam = typeof searchParams?.a === "string" ? searchParams.a : null

  const agent = (agentIdParam && (await getAgent(agentIdParam))) || DEFAULT_AGENT
  const session = await auth()
  const { id, image } = session?.user || {}

  return <Chat agent={agent} avatarUrl={image} userId={id} />
}
