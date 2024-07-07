import type { NextRequest } from "next/server"

import { AssistantResponse, type ToolCall } from "ai"

import { APP_URL } from "@/app/config"
import { openai } from "@/lib/openai"
import { auth } from "@/auth"
import deployContract from "@/lib/functions/deploy-contract/deploy-contract"
import { createAgent } from "@/lib/actions/ai"
import type { DbChat } from "@/lib/types"
import { storeChat } from "@/lib/actions/db"
import type { BadRequestError } from "openai/error.mjs"
import { resolveAddress, resolveDomain } from "@/lib/actions/tools"
// import sendEther from "@/lib/functions/send-ether"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  const session = await auth()
  const { id: userId, image: avatarUrl } = session?.user || {}

  const {
    message,
    threadId: threadIdFromClient,
    assistantId
  } = (await request.json()) as {
    message: string
    threadId: string
    assistantId: string
  }

  if (!assistantId) {
    throw new Error("Assistant ID is required")
  }

  const threadId = threadIdFromClient || (await openai.beta.threads.create()).id

  const { created_at: createdAt, id: messageId } = await openai.beta.threads.messages
    .create(threadId, {
      role: "user",
      content: message
    })
    .catch(async (reqError: BadRequestError & { error: Error }) => {
      const { error } = reqError
      if (error.message.includes("run_")) {
        console.error("Found pending run, cancelling run and retrying message")
        const runId = `run_${error.message.split("run_")[1].split(" ")[0]}`
        await openai.beta.threads.runs.cancel(threadId, runId)
        return await openai.beta.threads.messages.create(threadId, {
          role: "user",
          content: message
        })
      }
      throw error
    })

  // if threadId is not provided, store as new chat
  if (!threadIdFromClient && userId) {
    const title = message.slice(0, 50)
    const newChat: DbChat = {
      id: threadId,
      userId,
      title,
      agentId: assistantId,
      createdAt: createdAt,
      avatarUrl: avatarUrl,
      published: false,
      messages: [{ id: messageId, role: "user", content: message }]
    }

    await storeChat(newChat)
  }

  return AssistantResponse({ threadId, messageId }, async ({ forwardStream, sendDataMessage }) => {
    const runStream = openai.beta.threads.runs.stream(threadId, {
      assistant_id: assistantId,
      stream: true,
      model: "gpt-3.5-turbo"
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
                console.error(`Error in deployContract tool: ${err.message}`)
                return {
                  output: JSON.stringify({ error: `Error in deployContract tool: ${err.message}` }),
                  tool_call_id: toolCall.id
                }
              }
            }
            case "create_agent": {
              if (!userId) {
                return {
                  output: JSON.stringify({ error: "Unauthorized, user not signed in." }),
                  tool_call_id: toolCall.id
                }
              }
              const { name, description, instructions, creator, imageUrl } = parameters
              const assistantId = await createAgent({
                name,
                userId,
                description,
                instructions,
                creator: creator,
                imageUrl: imageUrl || "/assets/agent-factory.png"
              })

              if (!assistantId) {
                return {
                  output: JSON.stringify({ error: "Error creating agent" }),
                  tool_call_id: toolCall.id
                }
              }

              const agentChatUrl = `${APP_URL}/?a=${assistantId}`

              return {
                output: `Agent created: successfully, agent chat url: ${agentChatUrl}`,
                tool_call_id: toolCall.id
              }
            }
            // case "send_ether": {
            //   const { chainId, to, amount } = parameters
            //   try {
            //     const sendEtherResult = await sendEther({
            //       chainId,
            //       to,
            //       amount
            //     })

            //     return {
            //       output: `Sent ${amount} to ${to} txHash: ${sendEtherResult.txHash} explorerUrl: ${sendEtherResult.explorerUrl}`,
            //       tool_call_id: toolCall.id
            //     }
            //   } catch (error) {
            //     const err = error as Error
            //     console.error(`Error in sendEther tool: ${err.message}`)
            //     return {
            //       output: JSON.stringify({ error: `Error in sendEther tool: ${err.message}` }),
            //       tool_call_id: toolCall.id
            //     }
            //   }
            // }
            case "resolveDomain": {
              const { domain, ticker = "ETH" } = parameters
              try {
                const address = await resolveDomain(domain, ticker)
                return {
                  output: `Resolved address for domain ${domain}: ${address}`,
                  tool_call_id: toolCall.id
                }
              } catch (error) {
                const err = error as Error
                console.error(`Error in resolveDomain tool: ${err.message}`)
                return {
                  output: JSON.stringify({ error: `Error in resolveDomain tool: ${err.message}` }),
                  tool_call_id: toolCall.id
                }
              }
            }
            case "resolveAddress": {
              const { address } = parameters
              try {
                const domain = await resolveAddress(address)
                return {
                  output: `Resolved domain for address ${address}: ${domain}`,
                  tool_call_id: toolCall.id
                }
              } catch (error) {
                const err = error as Error
                console.error(`Error in resolveAddress tool: ${err.message}`)
                return {
                  output: JSON.stringify({ error: `Error in resolveAddress tool: ${err.message}` }),
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
        openai.beta.threads.runs.submitToolOutputsStream(threadId, runResult.id, { tool_outputs, stream: true })
      )
    }
  })
}
