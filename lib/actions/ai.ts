import { storeAgentAction } from "@/lib/actions"
import { openai } from "@/lib/data/openai"
import { TOOL_SCHEMAS, ToolName } from "@/lib/tools"
import type { CreateAgentParams } from "@/lib/types"

export const createAgentAction = async ({
  name,
  userId,
  description,
  instructions,
  creator,
  imageUrl
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
        TOOL_SCHEMAS[ToolName.ResolveDomain]
      ]
    })

    if (!userId) {
      throw new Error("Unauthorized")
    }

    await storeAgentAction({
      id,
      userId,
      name,
      description,
      creator,
      imageUrl
    })

    return id
  } catch (error) {
    console.error("Error in createAgent", error)
    return null
  }
}
