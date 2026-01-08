import { openai } from "@ai-sdk/openai"
import { type Message, streamText, tool } from "ai"
import { type NextRequest, NextResponse } from "next/server"
import { DEPLOYMENT_URL } from "vercel-url"
import { z } from "zod"
import { auth } from "@/auth"
import { resolveAddress, resolveDomain } from "@/lib/actions/unstoppable-domains"
import { DEFAULT_COMPILER_VERSION, SUPPORTED_CHAINS } from "@/lib/constants"
import { storeChat } from "@/lib/data/kv"
import { createAgent, getAssistantInstructions } from "@/lib/data/openai"
import { deployContract, deployTokenScript } from "@/lib/solidity/deploy"
import type { DbChat } from "@/lib/types"

const MAX_TITLE_LENGTH = 50

export const maxDuration = 60

export async function POST(request: NextRequest) {
  const session = await auth()
  const { id: userId, image: avatarUrl } = session?.user || {}

  const { messages, chatId, agentId } = (await request.json()) as {
    messages: Message[]
    chatId?: string
    agentId: string
  }

  if (!agentId) {
    return NextResponse.json({ error: "Agent ID is required" }, { status: 400 })
  }

  // Fetch agent instructions from OpenAI
  const agentInstructions = await getAssistantInstructions(agentId)

  // Build system prompt with latest settings
  const systemPrompt = `${agentInstructions || "You are a helpful assistant for Web3 development."}

Current Settings:
- Compiler Version: ${DEFAULT_COMPILER_VERSION}
- Available Chains: ${SUPPORTED_CHAINS.map((chain) => `${chain.name} (chainId: ${chain.id})`).join(", ")}`

  const result = streamText({
    model: openai("gpt-4.1-mini"),
    system: systemPrompt,
    messages,
    tools: {
      deployContract: tool({
        description:
          "Deploy a smart contract to an EVM compatible chain. Returns the tx hash of the deployment and an IPFS url to a directory with the files used for the contract deployment.",
        parameters: z.object({
          contractName: z.string().describe("The name of the contract to deploy"),
          chainId: z
            .number()
            .describe("The chainId to deploy to. A list of available chains will be made available to you at runtime."),
          sourceCode: z
            .string()
            .describe(
              'Source code of the smart contract. Format as a single-line string, with all line breaks and quotes escaped to be valid stringified JSON. Do not use any local imports or dependencies. Example import: import "@openzeppelin/contracts/token/ERC20/ERC20.sol" By default use SPDX License Identifier MIT and the latest available fixed Solidity version.'
            ),
          constructorArgs: z
            .array(z.union([z.string(), z.array(z.string())]))
            .default([])
            .describe(
              "Array of arguments for the contract's constructor. Each array item is a string or an array of strings. Empty array if the constructor has no arguments."
            ),
        }),
        execute: async ({ chainId, contractName, sourceCode, constructorArgs }) => {
          const deployResult = await deployContract({
            chainId,
            contractName,
            sourceCode,
            constructorArgs,
          })
          return `Contract Deployed: ${deployResult.explorerUrl} IPFS Repository: ${deployResult.ipfsUrl}`
        },
      }),
      createAgent: tool({
        description:
          "Create and publish an AI agent (assistant) to the Web3GPT Agents repository. Agents are generally for Solidity smart contract development but can also be created for anything else.",
        parameters: z.object({
          name: z.string().describe("The name of the agent."),
          description: z
            .string()
            .describe("The description of what the agent does. (short and used for informational purposes)"),
          instructions: z
            .string()
            .describe(
              "The instructions for the agent that determines how it interacts with users. This is the most important part of the agent. It should be clear and concise. Use markdown for formatting."
            ),
          creator: z.string().describe("The name of the agent creator"),
          imageUrl: z
            .string()
            .optional()
            .describe("A url used as the display image for the agent. If not provided, a default image will be used."),
        }),
        execute: async ({ name, description, instructions, creator, imageUrl }) => {
          if (!userId) {
            return JSON.stringify({ error: "Unauthorized, user not signed in." })
          }

          const createdAgentId = await createAgent({
            name,
            userId,
            description,
            instructions,
            creator,
            imageUrl: imageUrl || "/assets/agent-factory.png",
          })

          if (!createdAgentId) {
            return JSON.stringify({ error: "Error creating agent" })
          }

          const agentChatUrl = `${DEPLOYMENT_URL}/?a=${createdAgentId}`
          return `Agent created successfully, agent chat url: ${agentChatUrl}`
        },
      }),
      resolveDomain: tool({
        description: "Resolve a domain to a cryptocurrency address. Returns the resolved address for a given domain.",
        parameters: z.object({
          domain: z.string().describe("The domain to resolve (e.g., 'soko.eth')"),
          ticker: z.string().optional().default("ETH").describe("The cryptocurrency ticker (default: 'ETH')"),
        }),
        execute: async ({ domain, ticker = "ETH" }) => {
          const address = await resolveDomain(domain, ticker)
          return `Resolved address for domain ${domain}: ${address}`
        },
      }),
      resolveAddress: tool({
        description: "Resolve a cryptocurrency address to a domain. Returns the resolved domain for a given address.",
        parameters: z.object({
          address: z
            .string()
            .describe("The cryptocurrency address to resolve (e.g., '0x42e9c498135431a48796B5fFe2CBC3d7A1811927')"),
        }),
        execute: async ({ address }) => {
          const domain = await resolveAddress(address)
          return `Resolved domain for address ${address}: ${domain}`
        },
      }),
      deployTokenScript: tool({
        description:
          "Deploy a TokenScript to IPFS and update the scriptURI of an ERC721 or ERC20 token contract on an EVM compatible chain. Returns the transaction hash, explorer URL, IPFS URL, and a viewer URL for the deployed TokenScript.",
        parameters: z.object({
          chainId: z
            .string()
            .describe(
              "Supported chainIds: 84532: base sepolia, 80002: polygon amoy, 11155111: sepolia, 5003: mantle sepolia, 421614: arbitrum sepolia, 59902: metis sepolia, 44787: celo alfajores"
            ),
          tokenAddress: z.string().describe("The address of the token contract to update with the new TokenScript"),
          tokenName: z.string().describe("The name of the token, used in the TokenScript"),
          tokenScriptSource: z
            .string()
            .describe(
              "Source code of the TokenScript in XML format. Use the TokenScript template provided in the agent instructions, replacing placeholders as necessary."
            ),
          ensDomain: z
            .string()
            .optional()
            .describe(
              "Optional. The ENS domain to use if the TokenScript includes ENS naming feature. Should be one of: xnft.eth, smartlayer.eth, thesmartcats.eth, esp32.eth, cryptopunks.eth, 61cygni.eth"
            ),
          includeBurnFunction: z
            .boolean()
            .optional()
            .default(false)
            .describe("Optional. Whether to include a burn function in the TokenScript"),
        }),
        execute: async ({ chainId, tokenAddress, tokenName, tokenScriptSource, ensDomain, includeBurnFunction }) => {
          const deployResult = await deployTokenScript({
            chainId,
            tokenAddress: tokenAddress as `0x${string}`,
            tokenName,
            tokenScriptSource,
            ensDomain: ensDomain || "",
            includeBurnFunction,
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

          return output
        },
      }),
    },
    maxSteps: 5,
    onFinish: async ({ response }) => {
      // Store chat after completion if user is logged in
      if (userId && chatId) {
        // Convert response messages to the format expected by DbChat
        const responseMessages: Message[] = response.messages.map((msg) => {
          let content = ""
          if (typeof msg.content === "string") {
            content = msg.content
          } else if (Array.isArray(msg.content)) {
            content = msg.content
              .filter((part): part is { type: "text"; text: string } => "text" in part)
              .map((part) => part.text)
              .join("")
          }
          return {
            id: msg.id,
            role: msg.role as "user" | "assistant" | "system",
            content,
          }
        })
        const allMessages = [...messages, ...responseMessages]
        const firstUserMessage = messages.find((m) => m.role === "user")
        const title =
          typeof firstUserMessage?.content === "string"
            ? firstUserMessage.content.slice(0, MAX_TITLE_LENGTH)
            : "New Chat"

        const chat: DbChat = {
          id: chatId,
          userId,
          title,
          agentId,
          createdAt: Date.now(),
          avatarUrl,
          published: false,
          messages: allMessages,
        }

        await storeChat({ data: chat, userId })
      }
    },
  })

  return result.toDataStreamResponse()
}
