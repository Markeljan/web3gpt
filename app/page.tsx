import { Chat } from "@/components/chat/chat"
import { getAgent } from "@/lib/actions/db"
import type { NextPageProps } from "@/lib/types"

export default async function ChatPage({ searchParams }: NextPageProps) {
  const agentId = searchParams?.a as string
  const agent = (agentId && (await getAgent(agentId))) || undefined

  return <Chat agent={agent || undefined} />
}
