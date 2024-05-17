import Chat from "@/components/chat"
import { getAgent } from "@/app/actions"

export type ChatPageProps = {
  params: { id: string }
  searchParams?: { [key: string]: string | string[] | undefined }
}

export default async function ChatPage({ params, searchParams }: ChatPageProps) {
  const agentId = searchParams?.a as string | undefined
  const agent = (agentId && (await getAgent(agentId))) || undefined

  return <Chat agent={agent} />
}
