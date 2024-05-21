import { openai } from "@/lib/openai"
import type { NextRequest } from "next/server"

export const runtime = "nodejs"

// Create a new assistant
export async function POST(req: NextRequest) {
  const { instructions, name, model, tools } = await req.json()
  const assistant = await openai.beta.assistants.create({
    instructions: instructions,
    name: name,
    model: model,
    tools: tools
  })
  return Response.json({ assistantId: assistant.id })
}
