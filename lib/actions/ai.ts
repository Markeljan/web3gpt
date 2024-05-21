"use server"

import type { Message } from "ai"

import { storeAgent } from "@/lib/actions/db"
import { openai } from "@/lib/openai"
import type { CreateAgentParams } from "@/lib/actions/types"

export const createAgent = async ({
  name,
  userId,
  description,
  instructions,
  creator,
  imageUrl
}: CreateAgentParams) => {
  const assistantId = (
    await openai.beta.assistants.create({
      name: name,
      model: "gpt-4o",
      instructions: instructions
    })
  ).id

  if (!userId) {
    throw new Error("Unauthorized")
  }

  const res = await storeAgent({
    id: assistantId,
    userId,
    name,
    description,
    creator,
    imageUrl
  })

  if (res?.error) {
    return null
  }

  return assistantId
}

export const getAiThreadMessages = async (threadId: string) => {
  const fullMessages = (await openai.beta.threads.messages.list(threadId, { order: "asc" }))?.data

  return fullMessages?.map((message) => {
    const { id, content, role, created_at: createdAt } = message
    const textContent = content.find((c) => c.type === "text")
    const text = textContent?.type === "text" ? textContent.text.value : ""

    return {
      id,
      content: text,
      role,
      createdAt: new Date(createdAt * 1000)
    } as Message
  })
}
