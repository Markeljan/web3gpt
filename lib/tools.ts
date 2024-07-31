import type { FunctionTool } from "openai/resources/beta/assistants"

export enum ToolName {
  ResolveAddress = "resolveAddress",
  ResolveDomain = "resolveDomain",
  DeployContract = "deployContract",
  CreateAgent = "createAgent"
}

export const DEFAULT_TOOLS = [ToolName.ResolveAddress, ToolName.ResolveDomain, ToolName.DeployContract]

export const TOOL_SCHEMAS: Record<ToolName, FunctionTool> = {
  [ToolName.ResolveAddress]: {
    type: "function",
    function: {
      name: "resolveAddress",
      description: "Resolve a cryptocurrency address to a domain",
      parameters: {
        type: "object",
        description:
          "This function resolves a given cryptocurrency address to a domain. It returns the resolved domain.",
        properties: {
          address: {
            type: "string",
            description: "The cryptocurrency address to resolve (e.g., '0x42e9c498135431a48796B5fFe2CBC3d7A1811927')"
          }
        },
        required: ["address"]
      }
    }
  },
  [ToolName.ResolveDomain]: {
    type: "function",
    function: {
      name: "resolveDomain",
      description: "Resolve a domain to a cryptocurrency address",
      parameters: {
        type: "object",
        description:
          "This function resolves a given domain to a cryptocurrency address. It returns the resolved address.",
        properties: {
          domain: {
            type: "string",
            description: "The domain to resolve (e.g., 'soko.eth')"
          },
          ticker: {
            type: "string",
            description: "The cryptocurrency ticker (default: 'ETH')"
          }
        },
        required: ["domain"]
      }
    }
  },
  [ToolName.DeployContract]: {
    type: "function",
    function: {
      name: "deployContract",
      description: "Deploy a smart contract",
      parameters: {
        type: "object",
        description:
          "This function deploys a smart contract to an EVM compatible chain. It returns the tx hash of the deployment and an IPFS url to a directory with the files used for the contract deployment.",
        properties: {
          contractName: {
            type: "string"
          },
          chainId: {
            type: "string",
            description:
              "Supported chainIds: 17000: holesky, 84532: base sepolia, 80002: polygon amoy, 11155111: sepolia, 5003: mantle sepolia, 421614: arbitrum sepolia, 31: Rootstock Testnet",
            default: "421614"
          },
          sourceCode: {
            type: "string",
            description: `Source code of the smart contract. Format as a single-line string, with all line breaks and quotes escaped to be valid stringified JSON.  Do not use any local imports or dependencies.  Example import: import "@openzeppelin/contracts/token/ERC20/ERC20.sol"  By default use SPDX License Identifier MIT and Solidity version 0.8.26 unless otherwise specified.`
          },
          constructorArgs: {
            type: "array",
            description:
              "Array of arguments for the contract's constructor. Each array item is a string or an array of strings. Empty array if the constructor has no arguments.",
            items: {
              oneOf: [
                { type: "string" },
                {
                  type: "array",
                  items: { type: "string" }
                }
              ]
            },
            default: []
          }
        },
        required: ["contractName", "chainId", "sourceCode", "constructorArgs"]
      }
    }
  },
  [ToolName.CreateAgent]: {
    type: "function",
    function: {
      name: "createAgent",
      description: `Create and publish an AI agent (assistant) to the Web3GPT Agents repository.  Agents are generally for Solidity smart contract development but can also be created for anything else.  All agents have these tools available: ${DEFAULT_TOOLS.map(
        (tool) => tool
      ).join(", ")}`,
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "The name of the agent."
          },
          description: {
            type: "string",
            description: "The description of what the agent does. (short and used for informational purposes)"
          },
          instructions: {
            type: "string",
            description:
              "The instructions for the agent that determines how it interacts with users.  This is the most important part of the agent. It should be clear and concise.  Use markdown for formatting.  If the user doesn't provide in depth instructions, use your judgement to either ask for more information or expand on the instructions to make the agent more useful. Remind the user about the agent's available tools and capabilities if they go out of scope with their requested instructions."
          },
          creator: {
            type: "string",
            description: "The name of the agent creator"
          },
          imageUrl: {
            type: "string",
            description:
              "A url used as the display image for the agent.  If not provided, a default image will be used.  When given a link, display the link to the user using markdown to confirm that it works before finalizing the agent creation. (NOT <img> tag)"
          }
        },
        required: ["name", "description", "instructions", "creator"]
      }
    }
  }
}

export const ALL_TOOLS: FunctionTool[] = Object.values(TOOL_SCHEMAS)
