import "server-only"
import { kv } from "@vercel/kv"
import type { UIMessage } from "ai"
import { OpenAI } from "openai"
import { AGENTS_ARRAY, DEFAULT_AGENT } from "@/lib/constants"
import { getAgent } from "@/lib/data/kv"
import type { Agent } from "@/lib/types"

const openai = new OpenAI()

const AGENT_CACHE_TTL = 3600 // 1 hour

/**
 * Get an agent by ID - checks built-in agents first, then KV for user-created agents
 */
export const getAgentById = async (agentId: string): Promise<Agent> => {
  // Check built-in agents first (no cache needed, they're in-memory)
  const builtInAgent = AGENTS_ARRAY.find((a) => a.id === agentId)
  if (builtInAgent) {
    return builtInAgent
  }

  // Check cache for user-created agents
  const cacheKey = `agent:cache:${agentId}`
  const cached = await kv.get<Agent>(cacheKey)
  if (cached) {
    return cached
  }

  // Check KV for user-created agents
  const kvAgent = await getAgent(agentId)
  if (kvAgent) {
    await kv.set(cacheKey, kvAgent, { ex: AGENT_CACHE_TTL })
    return kvAgent
  }

  // Fallback to default agent
  return DEFAULT_AGENT
}

/**
 * Get agent instructions by ID
 */
export const getAgentInstructions = async (agentId: string): Promise<string | null> => {
  const agent = await getAgentById(agentId)
  return agent?.instructions || null
}

/**
 * Legacy function - kept for backward compatibility with old assistant-based chats
 * Fetches instructions from OpenAI Assistants API
 */
export const getAssistantInstructions = async (assistantId: string): Promise<string | null> => {
  // First check if this is a new-style agent ID
  if (assistantId.startsWith("agent_")) {
    return getAgentInstructions(assistantId)
  }

  // Check cache first
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
      await kv.set(cacheKey, instructions, { ex: AGENT_CACHE_TTL })
    }

    return instructions
  } catch {
    return null
  }
}

/**
 * Legacy function - get assistant ID from thread
 */
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

/**
 * Legacy function - get messages from OpenAI thread
 */
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
