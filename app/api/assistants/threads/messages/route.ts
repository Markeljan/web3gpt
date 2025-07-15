import { AssistantResponse } from "ai"
import { type NextRequest, NextResponse } from "next/server"
import type { BadRequestError } from "openai/error"
import type { FunctionToolCall } from "openai/resources/beta/threads/runs/index"
import { auth } from "@/auth"
import { resolveAddress, resolveDomain } from "@/lib/actions/unstoppable-domains"
import { DEFAULT_COMPILER_VERSION, DEPLOYMENT_URL, SUPPORTED_CHAINS } from "@/lib/config"
import { storeChat } from "@/lib/data/kv"
import { createAgent, openai } from "@/lib/data/openai"
import { deployContract, deployTokenScript } from "@/lib/solidity/deploy"
import { ToolName } from "@/lib/tools"
import type { DbChat } from "@/lib/types"

export async function POST(request: NextRequest) {
  const session = await auth()
  const { id: userId, image: avatarUrl } = session?.user || {}

  const {
    message,
    threadId: threadIdFromClient,
    assistantId,
  } = (await request.json()) as {
    message: string
    threadId: string
    assistantId: string
  }

  if (!assistantId) {
    console.error("Assistant ID is required")
    return NextResponse.json({ error: "Assistant ID is required" }, { status: 400 })
  }

  const threadId = threadIdFromClient || (await openai.beta.threads.create()).id

  const { created_at: createdAt, id: messageId } = await openai.beta.threads.messages
    .create(threadId, {
      role: "user",
      content: message,
    })
    .catch(async (reqError: BadRequestError & { error: Error }) => {
      const { error } = reqError
      if (error.message.includes("run_")) {
        console.error("Found pending run, cancelling run and retrying message")
        const runId = `run_${error.message.split("run_")[1].split(" ")[0]}`
        await openai.beta.threads.runs.cancel(runId, {
          thread_id: threadId,
        })
        return await openai.beta.threads.messages.create(threadId, {
          role: "user",
          content: message,
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
      messages: [{ id: messageId, role: "user", content: message }],
    }

    await storeChat({ data: newChat, userId })
  }

  return AssistantResponse({ threadId, messageId }, async ({ forwardStream }) => {
    const runStream = openai.beta.threads.runs.stream(threadId, {
      assistant_id: assistantId,
      stream: true,
      model: "gpt-4.1",
      additional_instructions: JSON.stringify({
        latestSettings: {
          compilerVersion: DEFAULT_COMPILER_VERSION,
          availableChains: SUPPORTED_CHAINS.map((chain) => {
            return {
              name: chain.name,
              id: chain.id,
            }
          }),
        },
      }),
    })

    let runResult = await forwardStream(runStream)

    while (runResult?.status === "requires_action" && runResult.required_action?.type === "submit_tool_outputs") {
      const tool_outputs = await Promise.all(
        runResult.required_action.submit_tool_outputs.tool_calls.map(async (toolCall: FunctionToolCall) => {
          const parameters = JSON.parse(toolCall.function.arguments)
          try {
            switch (toolCall.function.name) {
              case ToolName.DeployContract: {
                const { chainId, contractName, sourceCode, constructorArgs } = parameters
                const deployResult = await deployContract({
                  chainId,
                  contractName,
                  sourceCode,
                  constructorArgs,
                })

                return {
                  output: `Contract Deployed: ${deployResult.explorerUrl} IPFS Repository: ${deployResult.ipfsUrl}`,
                  tool_call_id: toolCall.id,
                }
              }
              case ToolName.CreateAgent: {
                if (!userId) {
                  return {
                    output: JSON.stringify({ error: "Unauthorized, user not signed in." }),
                    tool_call_id: toolCall.id,
                  }
                }
                const { name, description, instructions, creator, imageUrl } = parameters
                const assistantId = await createAgent({
                  name,
                  userId,
                  description,
                  instructions,
                  creator: creator,
                  imageUrl: imageUrl || "/assets/agent-factory.png",
                })

                if (!assistantId) {
                  return {
                    output: JSON.stringify({ error: "Error creating agent" }),
                    tool_call_id: toolCall.id,
                  }
                }

                const agentChatUrl = `${DEPLOYMENT_URL}/?a=${assistantId}`

                return {
                  output: `Agent created: successfully, agent chat url: ${agentChatUrl}`,
                  tool_call_id: toolCall.id,
                }
              }
              case ToolName.ResolveDomain: {
                const { domain, ticker = "ETH" } = parameters
                const address = await resolveDomain(domain, ticker)
                return {
                  output: `Resolved address for domain ${domain}: ${address}`,
                  tool_call_id: toolCall.id,
                }
              }
              case ToolName.ResolveAddress: {
                const { address } = parameters
                const domain = await resolveAddress(address)
                return {
                  output: `Resolved domain for address ${address}: ${domain}`,
                  tool_call_id: toolCall.id,
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
                  includeBurnFunction: includeBurnFunction || false,
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
                  tool_call_id: toolCall.id,
                }
              }

              default:
                throw new Error(`Unknown tool call function: ${toolCall.function.name}`)
            }
          } catch (error) {
            const stringifiedError = `Error in tool call: ${JSON.stringify(
              error instanceof Error
                ? {
                    message: error.message,
                    stack: error.stack,
                  }
                : { error },
            )}`

            console.error(stringifiedError)
            return {
              output: stringifiedError,
              tool_call_id: toolCall.id,
            }
          }
        }),
      )

      runResult = await forwardStream(
        openai.beta.threads.runs.submitToolOutputsStream(runResult.id, {
          thread_id: threadId,
          tool_outputs,
          stream: true,
        }),
      )
    }
  })
}
