import { openai, OPENAI_ASSISTANT_ID } from "@/app/config"
import type { NextRequest } from "next/server"

export const runtime = "nodejs"

// Send a new message to a thread
export async function POST(request: NextRequest, { params: { threadId } }: { params: { threadId: string } }) {
  const { content } = await request.json()

  await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content: content
  })

  const stream = openai.beta.threads.runs.stream(threadId, {
    assistant_id: OPENAI_ASSISTANT_ID
  })

  return new Response(stream.toReadableStream())
}
