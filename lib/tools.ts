import { tool } from "ai"
import { DEPLOYMENT_URL } from "vercel-url"
import { z } from "zod"
import { resolveAddress, resolveDomain } from "@/lib/actions/unstoppable-domains"
import { createAgent } from "@/lib/data/openai"
import { deployContract } from "@/lib/solidity/deploy"

// Tool names for reference
export const TOOL_NAMES = ["resolveAddress", "resolveDomain", "deployContract", "createAgent"] as const
export type ToolName = (typeof TOOL_NAMES)[number]
export const DEFAULT_TOOLS: ToolName[] = ["resolveAddress", "resolveDomain", "deployContract"]

// Zod schemas (exported for reuse/testing)
export const schemas = {
  resolveAddress: z.object({
    address: z
      .string()
      .describe("The cryptocurrency address to resolve (e.g., '0x42e9c498135431a48796B5fFe2CBC3d7A1811927')"),
  }),

  resolveDomain: z.object({
    domain: z.string().describe("The domain to resolve (e.g., 'soko.eth')"),
    ticker: z.string().optional().default("ETH").describe("The cryptocurrency ticker (default: 'ETH')"),
  }),

  deployContract: z.object({
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
        "Array of arguments for the contract's constructor. Each argument should be a string representation of the value. Pass an empty array [] if the constructor has no arguments."
      ),
  }),

  createAgent: z.object({
    name: z.string().describe("The name of the agent."),
    description: z
      .string()
      .describe("The description of what the agent does. (short and used for informational purposes)"),
    instructions: z
      .string()
      .describe(
        "The instructions for the agent that determines how it interacts with users. This is the most important part of the agent. It should be clear and concise. Use markdown for formatting. If the user doesn't provide in depth instructions, use your judgement to either ask for more information or expand on the instructions to make the agent more useful. Remind the user about the agent's available tools and capabilities if they go out of scope with their requested instructions."
      ),
    creator: z.string().describe("The name of the agent creator"),
    imageUrl: z
      .string()
      .optional()
      .describe(
        "A url used as the display image for the agent. If not provided, a default image will be used. When given a link, display the link to the user using markdown to confirm that it works before finalizing the agent creation. (NOT <img> tag)"
      ),
  }),
}

// Context required for tools that need runtime data
export type ToolContext = {
  userId?: string
}

/**
 * Creates the tools object with execute functions.
 * Pass context for tools that require runtime data (e.g., userId for createAgent).
 */
export function createTools(context: ToolContext = {}) {
  return {
    resolveAddress: tool({
      description: "Resolve a cryptocurrency address to a domain. Returns the resolved domain for a given address.",
      inputSchema: schemas.resolveAddress,
      execute: async ({ address }) => {
        const domain = await resolveAddress(address)
        return `Resolved domain for address ${address}: ${domain}`
      },
    }),

    resolveDomain: tool({
      description: "Resolve a domain to a cryptocurrency address. Returns the resolved address for a given domain.",
      inputSchema: schemas.resolveDomain,
      execute: async ({ domain, ticker = "ETH" }) => {
        const address = await resolveDomain(domain, ticker)
        return `Resolved address for domain ${domain}: ${address}`
      },
    }),

    deployContract: tool({
      description:
        "Deploy a smart contract to an EVM compatible chain. Returns the tx hash of the deployment and an IPFS url to a directory with the files used for the contract deployment.",
      inputSchema: schemas.deployContract,
      execute: async ({ chainId, contractName, sourceCode, constructorArgs = [] }) => {
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
      description: `Create and publish an AI agent (assistant) to the Web3GPT Agents repository. Agents are generally for Solidity smart contract development but can also be created for anything else. All agents have these tools available: ${DEFAULT_TOOLS.join(", ")}`,
      inputSchema: schemas.createAgent,
      execute: async ({ name, description, instructions, creator, imageUrl }) => {
        const { userId } = context

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
  }
}

// Type for the tools object
export type Tools = ReturnType<typeof createTools>
