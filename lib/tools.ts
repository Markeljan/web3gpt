import { tool } from "ai"
import { z } from "zod"

export const DEFAULT_TOOLS = ["resolveAddress", "resolveDomain", "deployContract"]

export const resolveAddressTool = tool({
  description: "Resolve a cryptocurrency address to a domain. Returns the resolved domain for a given address.",
  parameters: z.object({
    address: z
      .string()
      .describe("The cryptocurrency address to resolve (e.g., '0x42e9c498135431a48796B5fFe2CBC3d7A1811927')"),
  }),
})

export const resolveDomainTool = tool({
  description: "Resolve a domain to a cryptocurrency address. Returns the resolved address for a given domain.",
  parameters: z.object({
    domain: z.string().describe("The domain to resolve (e.g., 'soko.eth')"),
    ticker: z.string().optional().default("ETH").describe("The cryptocurrency ticker (default: 'ETH')"),
  }),
})

export const deployContractTool = tool({
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
})

export const createAgentTool = tool({
  description: `Create and publish an AI agent (assistant) to the Web3GPT Agents repository. Agents are generally for Solidity smart contract development but can also be created for anything else. All agents have these tools available: ${DEFAULT_TOOLS.join(", ")}`,
  parameters: z.object({
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
})

export const deployTokenScriptTool = tool({
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
})

// Export all tools as an object for use in the API route
export const TOOLS = {
  resolveAddress: resolveAddressTool,
  resolveDomain: resolveDomainTool,
  deployContract: deployContractTool,
  createAgent: createAgentTool,
  deployTokenScript: deployTokenScriptTool,
}
