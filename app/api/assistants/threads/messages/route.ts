import type { NextRequest } from "next/server"

import { AssistantResponse } from "ai"
import type { BadRequestError } from "openai/error"

import { auth } from "@/auth"
import { createAgent } from "@/lib/actions/ai"
import { storeChat } from "@/lib/actions/db"
import { deployContract } from "@/lib/actions/solidity/deploy-contract"
import { deployTokenScript } from "@/lib/actions/solidity/deploy-tokenscript"
import { resolveAddress, resolveDomain } from "@/lib/actions/unstoppable-domains"
import { APP_URL } from "@/lib/config"
import { openai } from "@/lib/openai"
import { ToolName } from "@/lib/tools"
import type { DbChat } from "@/lib/types"

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

  return AssistantResponse({ threadId, messageId }, async ({ forwardStream }) => {
    const runStream = openai.beta.threads.runs.stream(threadId, {
      assistant_id: assistantId,
      stream: true,
      model: "gpt-4o-mini"
    })

    // forward run status would stream message deltas
    let runResult = await forwardStream(runStream)

    while (runResult?.status === "requires_action" && runResult.required_action?.type === "submit_tool_outputs") {
      const tool_outputs = await Promise.all(
        runResult.required_action.submit_tool_outputs.tool_calls.map(async (toolCall) => {
          const parameters = JSON.parse(toolCall.function.arguments)
          try {
            switch (toolCall.function.name) {
              case ToolName.DeployContract: {
                const { chainId, contractName, sourceCode, constructorArgs } = parameters
                const deployResult = await deployContract({
                  chainId,
                  contractName,
                  sourceCode,
                  constructorArgs
                })

                return {
                  output: `Contract Deployed: ${deployResult.explorerUrl} IPFS Repository: ${deployResult.ipfsUrl}`,
                  tool_call_id: toolCall.id
                }
              }
              case ToolName.CreateAgent: {
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
              case ToolName.ResolveDomain: {
                const { domain, ticker = "ETH" } = parameters
                const address = await resolveDomain(domain, ticker)
                return {
                  output: `Resolved address for domain ${domain}: ${address}`,
                  tool_call_id: toolCall.id
                }
              }
              case ToolName.ResolveAddress: {
                const { address } = parameters
                const domain = await resolveAddress(address)
                return {
                  output: `Resolved domain for address ${address}: ${domain}`,
                  tool_call_id: toolCall.id
                }
              }
              case ToolName.DeployTokenScript: {
                const { chainId, tokenAddress, tokenName, tokenScriptSource, ensDomain, includeBurnFunction } =
                  parameters

                const deployResult = await deployTokenScript({
                  chainId,
                  tokenAddress,
                  tokenName,
                  tokenScriptSource,
                  ensDomain,
                  includeBurnFunction: includeBurnFunction || false
                })

                let output = "TokenScript deployed:\n"
                output += `Explorer URL: ${deployResult.explorerUrl}\n`
                output += `IPFS URL: ${deployResult.ipfsUrl}\n`
                output += `Viewer URL: ${deployResult.viewerUrl}`

                if (ensDomain) {
                  output += `\nENS Domain: ${ensDomain}`
                }

                if (includeBurnFunction) {
                  output += "\nBurn function included in TokenScript"
                }

                return {
                  output,
                  tool_call_id: toolCall.id
                }
              }

              default:
                throw new Error(`Unknown tool call function: ${toolCall.function.name}`)
            }
          } catch (error) {
            const err = error as Error
            console.error(`Error in tool call: ${err.message}`)
            return {
              output: JSON.stringify({ error: `Error in tool call: ${err.message}` }),
              tool_call_id: toolCall.id
            }
          }
        })
      )

      runResult = await forwardStream(
        openai.beta.threads.runs.submitToolOutputsStream(threadId, runResult.id, { tool_outputs, stream: true })
      )
    }
  })
}
