import { openai, OPENAI_ASSISTANT_ID } from "@/app/config"
import { AssistantResponse, type ToolCall } from "ai"
import type { NextRequest } from "next/server"

export const runtime = "nodejs"

// Send a new message to a thread
export async function POST(request: NextRequest, { params: { threadId } }: { params: { threadId: string } }) {
  const { message } = await request.json()

  const createdMessage = await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content: message
  })

  return AssistantResponse({ threadId, messageId: createdMessage.id }, async ({ forwardStream, sendDataMessage }) => {
    // Run the assistant on the thread
    const runStream = openai.beta.threads.runs.stream(threadId, {
      assistant_id: OPENAI_ASSISTANT_ID
    })

    // forward run status would stream message deltas
    let runResult = await forwardStream(runStream)

    // status can be: queued, in_progress, requires_action, cancelling, cancelled, failed, completed, or expired
    while (runResult?.status === "requires_action" && runResult.required_action?.type === "submit_tool_outputs") {
      const tool_outputs = runResult.required_action.submit_tool_outputs.tool_calls.map((toolCall: ToolCall) => {
        const parameters = JSON.parse(toolCall.function.arguments)

        switch (toolCall.function.name) {
          // configure your tool calls here

          default:
            throw new Error(`Unknown tool call function: ${toolCall.function.name}`)
        }
      })

      runResult = await forwardStream(
        openai.beta.threads.runs.submitToolOutputsStream(threadId, runResult.id, { tool_outputs })
      )
    }
  })
}
