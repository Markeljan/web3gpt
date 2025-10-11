import "server-only"

import type { Message } from "ai"
import { OpenAI } from "openai"
import { storeAgent } from "@/lib/data/kv"
import { TOOL_SCHEMAS } from "@/lib/tools"
import type { CreateAgentParams } from "@/lib/types"

export const openai = new OpenAI()
const SECOND_IN_MS = 1000

export const getAiThreadMessages = async (threadId: string) => {
  const fullMessages = (await openai.beta.threads.messages.list(threadId, { order: "asc" })).data

  return fullMessages.map((message) => {
    const { id, content, role, created_at: createdAt } = message
    const textContent = content.find((c) => c.type === "text")
    const text = textContent?.type === "text" ? textContent.text.value : ""

    return {
      id,
      content: text,
      role,
      createdAt: new Date(createdAt * SECOND_IN_MS),
    } satisfies Message
  })
}

export const createAgent = async ({
  name,
  userId,
  description,
  instructions,
  creator,
  imageUrl,
}: CreateAgentParams) => {
  try {
    const { id } = await openai.beta.assistants.create({
      name,
      model: "gpt-4.1-mini",
      description,
      instructions,
      tools: [TOOL_SCHEMAS.deployContract, TOOL_SCHEMAS.resolveAddress, TOOL_SCHEMAS.resolveDomain],
    })

    if (!userId) {
      throw new Error("Unauthorized")
    }

    await storeAgent({
      id,
      userId,
      name,
      description,
      creator,
      imageUrl,
    })

    return id
  } catch (_error) {
    return null
  }
}
