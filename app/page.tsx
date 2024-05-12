import Chat from "@/components/chat"
import { getAgent } from "./actions"
import { revalidatePath } from "next/cache"

export interface ChatPageProps {
  params: { id: string }
  searchParams?: { [key: string]: string | string[] | undefined }
}

export default async function ChatPage({ params, searchParams }: ChatPageProps) {
  const agentId = searchParams?.a as string | undefined
  const agent = (agentId && (await getAgent(agentId))) || undefined
  revalidatePath("/")

  return <Chat agent={agent} />
}
