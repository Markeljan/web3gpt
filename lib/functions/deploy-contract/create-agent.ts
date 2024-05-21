import { openai } from "@/app/config"
import { storeAgent } from "@/app/actions"

type CreateAgentParams = {
  name: string
  userId: number
  description: string
  instructions: string
  creator: string
  imageUrl: string
}

export default async function createAgent({
  name,
  userId,
  description,
  instructions,
  creator,
  imageUrl
}: CreateAgentParams): Promise<string | null> {
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
