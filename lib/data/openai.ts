import "server-only"
import { kv } from "@vercel/kv"
import type { UIMessage } from "ai"
import { OpenAI } from "openai"
import { storeAgent } from "@/lib/data/kv"
import type { CreateAgentParams } from "@/lib/types"

const openai = new OpenAI()

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

export const getAiThreadAssistantId = async (threadId: string): Promise<string | null> => {
  try {
    // Get the most recent run to find the assistant ID
    const runs = await openai.beta.threads.runs.list(threadId, { order: "desc" })
    if (runs.data.length > 0 && runs.data[0].assistant_id) {
      return runs.data[0].assistant_id
    }
    return null
  } catch {
    return null
  }
}

export const getAiThreadMessages = async (threadId: string): Promise<UIMessage[]> => {
  const fullMessages = (await openai.beta.threads.messages.list(threadId, { order: "asc" })).data

  const messages: UIMessage[] = fullMessages
    .map((message: OpenAI.Beta.Threads.Messages.Message): UIMessage | null => {
      const { id, content, role } = message
      const textContent = content.find((c) => c.type === "text")
      const text = textContent?.type === "text" ? textContent.text.value : ""

      // Filter out system messages and ensure role is valid
      if (role !== "user" && role !== "assistant") {
        return null
      }

      return {
        id,
        parts: [{ type: "text", text }],
        role: role as "user" | "assistant",
      } satisfies UIMessage
    })
    .filter((msg: UIMessage | null): msg is UIMessage => msg !== null)

  return messages
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
      model: "gpt-5-mini",
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
