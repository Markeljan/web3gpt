import { NextResponse, type NextRequest } from "next/server"

import { openai } from "@/app/config"
import deployContract from "@/lib/functions/deploy-contract/deploy-contract"
import { kv } from "@vercel/kv"
import { AssistantResponse, type ToolCall } from "ai"
import createAgent from "@/lib/functions/deploy-contract/create-agent"
import { APP_URL, W3GPT_API_SECRET } from "@/lib/constants"

export const runtime = "nodejs"

// const { ownerAddress, contractName, sourceCode, constructorArgs } = json

// Send a new message to a thread
export async function POST(req: NextRequest) {
  // const apiSecret = req.headers.get("W3GPT_API_SECRET")
  // if (apiSecret !== W3GPT_API_SECRET) {
  //   return NextResponse.json({ error: "Unauthorized: invalid W3GPT_API_SECRET" }, { status: 401 })
  // }

  const resJson = await req.json()
  console.log("reqJson", resJson)

  if (!resJson.ownerAddress) {
    throw new Error("OwnerAddress missing in body")
  }

  return NextResponse.json({ message: "success" }, { status: 200 })
}

export const OPTIONS = async (req: NextRequest) => {
  return new NextResponse("", {
    status: 200
  })
}

//   const {
//     message,
//     threadId: requestThreadId,
//     assistantId
//   } = (await req.json()) as {
//     message: string
//     threadId: string
//     assistantId: string
//   }

//   if (!assistantId) {
//     throw new Error("Assistant ID is required")
//   }

//   const threadId = requestThreadId || (await openai.beta.threads.create()).id

//   const { created_at: createdAt, id: messageId } = await openai.beta.threads.messages.create(threadId, {
//     role: "user",
//     content: message
//   })

//   if (!requestThreadId) {
//     const title = message.slice(0, 50)
//     const newChat = {
//       id: threadId,
//       agentId: assistantId,
//       title,
//       createdAt
//     }
//     await kv.hmset(`external:${threadId}`, newChat)
//     await kv.zadd(`external:thread:${threadId}`, {
//       score: createdAt,
//       member: `external:${threadId}`
//     })
//   }

//   return AssistantResponse({ threadId, messageId }, async ({ forwardStream, sendDataMessage }) => {
//     // Run the assistant on the thread
//     const runStream = openai.beta.threads.runs.stream(threadId, {
//       assistant_id: assistantId,
//       stream: true
//     })

//     // forward run status would stream message deltas
//     let runResult = await forwardStream(runStream)

//     // status can be: queued, in_progress, requires_action, cancelling, cancelled, failed, completed, or expired
//     while (runResult?.status === "requires_action" && runResult.required_action?.type === "submit_tool_outputs") {
//       const tool_outputs = await Promise.all(
//         runResult.required_action.submit_tool_outputs.tool_calls.map(async (toolCall: ToolCall) => {
//           const parameters = JSON.parse(toolCall.function.arguments)
//           switch (toolCall.function.name) {
//             case "deploy_contract": {
//               const { chainId, contractName, sourceCode, constructorArgs } = parameters
//               try {
//                 const deployResult = await deployContract({
//                   chainId,
//                   contractName,
//                   sourceCode,
//                   constructorArgs
//                 })

//                 // sendDataMessage({
//                 //   id: id,
//                 //   role: "data",
//                 //   data: { explorerUrl: deployResult.explorerUrl, ipfsUrl: deployResult.ipfsUrl }
//                 // })

//                 return {
//                   output: `Contract deployed: ${deployResult.explorerUrl} code uploaded on IPFS: ${deployResult.ipfsUrl}`,
//                   tool_call_id: toolCall.id
//                 }
//               } catch (error) {
//                 const err = error as Error
//                 console.error(`Error in deployContract: ${err.message}`)
//                 return {
//                   output: JSON.stringify({ error: `Error in deployContract: ${err.message}` }),
//                   tool_call_id: toolCall.id
//                 }
//               }
//             }
//             case "create_agent": {
//               const { name, description, instructions, creator, imageUrl } = parameters
//               const assistantId = await createAgent({
//                 name,
//                 description,
//                 instructions,
//                 creator: creator,
//                 imageUrl: imageUrl || "/assets/agent-factory.webp"
//               })

//               if (!assistantId) {
//                 return {
//                   output: JSON.stringify({ error: "Error creating agent" }),
//                   tool_call_id: toolCall.id
//                 }
//               }

//               const agentChatUrl = `${APP_URL}/?a=${assistantId}`

//               return {
//                 output: `Agent created: successfully, agent chat url: ${agentChatUrl}`,
//                 tool_call_id: toolCall.id
//               }
//             }

//             default:
//               throw new Error(`Unknown tool call function: ${toolCall.function.name}`)
//           }
//         })
//       )

//       runResult = await forwardStream(
//         openai.beta.threads.runs.submitToolOutputsStream(threadId, runResult.id, { tool_outputs, stream: true })
//       )
//     }
//   })
// }
