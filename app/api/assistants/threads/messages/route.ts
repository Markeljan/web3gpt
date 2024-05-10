import { openai, OPENAI_ASSISTANT_ID } from "@/app/config"
import { auth } from "@/auth"
import deployContract from "@/lib/functions/deploy-contract/deploy-contract"
import { kv } from "@vercel/kv"
import { AssistantResponse, type ToolCall } from "ai"
import type { NextRequest } from "next/server"
import type { TextContentBlock } from "openai/resources/beta/threads/messages.mjs"

export const runtime = "nodejs"

// Send a new message to a thread
export async function POST(request: NextRequest) {
  const { message, threadId: threadIdFromClient } = await request.json()

  const threadId = threadIdFromClient || (await openai.beta.threads.create()).id

  const session = await auth()
  const { id: userId, image: avatarUrl } = session?.user ?? {}

  const [{ created_at: createdAt, id: messageId }, title] = await Promise.all([
    openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: message
    }),
    // Get the first message in the thread to use as the title or fallback to the message
    (
      (
        (
          await openai.beta.threads.messages.list(threadId, {
            limit: 1,
            order: "desc"
          })
        )?.data?.[0]?.content?.[0] as TextContentBlock
      )?.text?.value || message
    )?.substring(0, 100)
  ])

  const path = `/chat/${threadId}`

  const payload = {
    id: threadId,
    title,
    userId,
    createdAt,
    avatarUrl,
    path
  }
  await kv.hmset(`chat:${threadId}`, payload)
  await kv.zadd(`user:chat:${userId}`, {
    score: createdAt,
    member: `chat:${threadId}`
  })

  console.log("path", path)

  return AssistantResponse({ threadId, messageId }, async ({ forwardStream, sendDataMessage }) => {
    // Run the assistant on the thread
    const runStream = openai.beta.threads.runs.stream(threadId, {
      assistant_id: OPENAI_ASSISTANT_ID,
      stream: true
    })

    // forward run status would stream message deltas
    let runResult = await forwardStream(runStream)

    // status can be: queued, in_progress, requires_action, cancelling, cancelled, failed, completed, or expired
    while (runResult?.status === "requires_action" && runResult.required_action?.type === "submit_tool_outputs") {
      const tool_outputs = await Promise.all(
        runResult.required_action.submit_tool_outputs.tool_calls.map(async (toolCall: ToolCall) => {
          const parameters = JSON.parse(toolCall.function.arguments)
          switch (toolCall.function.name) {
            case "deploy_contract": {
              const { chainId, contractName, sourceCode, constructorArgs } = parameters
              try {
                const deployResult = await deployContract({
                  chainId,
                  contractName,
                  sourceCode,
                  constructorArgs
                })

                // sendDataMessage({
                //   id: id,
                //   role: "data",
                //   data: { explorerUrl: deployResult.explorerUrl, ipfsUrl: deployResult.ipfsUrl }
                // })

                return {
                  output: `Contract deployed: ${deployResult.explorerUrl} code uploaded on IPFS: ${deployResult.ipfsUrl}`,
                  tool_call_id: toolCall.id
                }
              } catch (error) {
                const err = error as Error
                console.error(`Error in deployContract: ${err.message}`)
                return {
                  output: JSON.stringify({ error: `Error in deployContract: ${err.message}` }),
                  tool_call_id: toolCall.id
                }
              }
            }

            default:
              throw new Error(`Unknown tool call function: ${toolCall.function.name}`)
          }
        })
      )

      runResult = await forwardStream(
        openai.beta.threads.runs.submitToolOutputsStream(threadId, runResult.id, { tool_outputs })
      )
    }
  })
}
