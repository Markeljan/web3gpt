import "server-only"

import type { Message } from "ai"
import { OpenAI } from "openai"

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
      createdAt: new Date(createdAt * 1000)
    } satisfies Message
  })
}
