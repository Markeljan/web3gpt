import type { UIMessage } from "ai"
import type { Abi, Chain, Hash } from "viem"

export type NextPageProps = {
  params: Promise<{ id: string }>
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

// Support both v4 (content) and v5 (parts) message formats for backward compatibility
export type LegacyMessage = {
  id: string
  role: "user" | "assistant" | "system"
  content?: string
  parts?: UIMessage["parts"]
}

export type DbChat = {
  id: string
  agentId: string
  title: string
  createdAt: number
  userId: string
  messages: (UIMessage | LegacyMessage)[]
  published: boolean
  avatarUrl?: string | null
}

export type DbChatListItem = {
  id: string
  agentId: string
  createdAt: number
  title: string
  userId: string
  published: boolean
}

export type SkillChat = {
  id: string
  agentId: string
  createdAt: number
  title: string
  messages: UIMessage[]
}

export type SkillChatHistoryItem = {
  id: string
  role: "user" | "assistant" | "system"
  text: string
}

export type ToolName = "resolveAddress" | "resolveDomain" | "deployContract" | "createAgent"

export type Agent = {
  id: string
  userId: string
  name: string
  description: string
  instructions: string
  imageUrl: string
  creator: string
  toolNames: ToolName[]
}

export type CreateAgentParams = Omit<Agent, "id">

export type DeployContractParams = {
  chainId: number
  contractName: string
  sourceCode: string
  constructorArgs: Array<string | string[]>
  imports?: Record<string, string>
}

export type DeployContractResult = {
  contractAddress: Hash
  sourceCode: string
  explorerUrl: string
  ipfsUrl: string
  verifyContractConfig: VerifyContractParams
  abi: Abi
  standardJsonInput: string
}

export type VerifyContractParams = {
  deployHash: Hash
  contractAddress: Hash
  standardJsonInput: string
  encodedConstructorArgs: string
  fileName: string
  contractName: string
  viemChain: Omit<Chain, "contracts" | "ensRegistry" | "ensUniversalResolver" | "multicall3" | "formatters">
}

export type LastDeploymentData = DeployContractResult & {
  walletAddress: Hash
  chainId: number
  transactionHash: Hash
}

export type DeploymentRecordBase = {
  cid: string
  chainId: number
  contractAddress: Hash
  deployHash: Hash
}

export type DeploymentRecord = DeploymentRecordBase & {
  contractName: string
  deployerAddress: Hash
}

export type ChainWithIcon = Chain & { iconUrl: string; iconBackground: string }

export type ChainDetails = {
  rpcUrl: string
  explorerUrl: string
  explorerApiUrl: string
  explorerApiKey: string
}
