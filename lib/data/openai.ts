import "server-only"

import type { Message } from "ai"
import { OpenAI } from "openai"
import type { CreateAgentParams } from "@/lib/types"
import { TOOL_SCHEMAS, ToolName } from "@/lib/tools"
import { storeAgent } from "@/lib/data/kv"

export const openai = new OpenAI()

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
      createdAt: new Date(createdAt * 1000),
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
      name: name,
      model: "gpt-4o",
      description: description,
      instructions: instructions,
      tools: [
        TOOL_SCHEMAS[ToolName.DeployContract],
        TOOL_SCHEMAS[ToolName.ResolveAddress],
        TOOL_SCHEMAS[ToolName.ResolveDomain],
      ],
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
  } catch (error) {
    console.error("Error in createAgent", error)
    return null
  }
}
