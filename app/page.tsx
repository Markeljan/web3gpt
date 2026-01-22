import { auth } from "@/auth"
import { Chat } from "@/components/chat/chat"
import { DEFAULT_AGENT } from "@/lib/constants"
import { getAgentById } from "@/lib/data/openai"
import type { NextPageProps } from "@/lib/types"

export default async function ChatPage({ searchParams }: NextPageProps) {
  const searchParamsResolved = await searchParams
  const agentIdParam = typeof searchParamsResolved?.a === "string" ? searchParamsResolved.a : null

  const agent = (agentIdParam && (await getAgentById(agentIdParam))) || DEFAULT_AGENT
  const session = await auth()
  const { id, image } = session?.user || {}

  return <Chat agent={agent} avatarUrl={image} userId={id} />
}
