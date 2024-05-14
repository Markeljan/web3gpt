import { openai } from "@/app/config"
import { storeAgent } from "@/app/actions"

type CreateAgentParams = {
  name: string
  description: string
  instructions: string
  creator: string
  imageUrl: string
}

export default async function createAgent({
  name,
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

  const res = await storeAgent({
    id: assistantId,
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
