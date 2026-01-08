import "server-only"

import { kv } from "@vercel/kv"
import type { Message } from "ai"
import { OpenAI } from "openai"
import { storeAgent } from "@/lib/data/kv"
import type { CreateAgentParams } from "@/lib/types"

const openai = new OpenAI()

const SECOND_IN_MS = 1000
const INSTRUCTIONS_CACHE_TTL = 3600 // 1 hour

export const getAssistantInstructions = async (assistantId: string): Promise<string | null> => {
  // Try to get from cache first
  const cacheKey = `assistant:instructions:${assistantId}`
  const cached = await kv.get<string>(cacheKey)
  if (cached) {
    return cached
  }

  try {
    const assistant = await openai.beta.assistants.retrieve(assistantId)
    const instructions = assistant.instructions || null

    // Cache the instructions
    if (instructions) {
      await kv.set(cacheKey, instructions, { ex: INSTRUCTIONS_CACHE_TTL })
    }

    return instructions
  } catch {
    return null
  }
}

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
    // Create an OpenAI assistant with the provided instructions
    const { id } = await openai.beta.assistants.create({
      name,
      model: "gpt-4.1-mini",
      description,
      instructions,
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
  } catch {
    return null
  }
}
