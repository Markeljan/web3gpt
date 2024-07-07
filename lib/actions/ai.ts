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
      instructions: instructions,
      // tools: [
      //   {
      //     type: "function",
      //     function: {
      //       name: "resolveAddress",
      //       description: "Resolve a cryptocurrency address to a domain",
      //       parameters: {
      //         type: "object",
      //         description:
      //           "This function resolves a given cryptocurrency address to a domain. It returns the resolved domain.",
      //         properties: {
      //           address: {
      //             type: "string",
      //             description:
      //               "The cryptocurrency address to resolve (e.g., '0x42e9c498135431a48796B5fFe2CBC3d7A1811927')"
      //           }
      //         },
      //         required: ["address"]
      //       }
      //     }
      //   },
      //   {
      //     type: "function",
      //     function: {
      //       name: "resolveDomain",
      //       description: "Resolve a domain to a cryptocurrency address",
      //       parameters: {
      //         type: "object",
      //         description:
      //           "This function resolves a given domain to a cryptocurrency address. It returns the resolved address.",
      //         properties: {
      //           domain: {
      //             type: "string",
      //             description: "The domain to resolve (e.g., 'soko.eth')"
      //           },
      //           ticker: {
      //             type: "string",
      //             description: "The cryptocurrency ticker (default: 'ETH')"
      //           }
      //         },
      //         required: ["domain"]
      //       }
      //     }
      //   }
      // ]
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
