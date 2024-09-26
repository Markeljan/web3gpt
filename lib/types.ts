import type { Message } from "ai"
import type { Abi, Chain, Hash } from "viem"

export type NextPageProps = {
  params: { id: string }
  searchParams?: { [key: string]: string | string[] | undefined }
}

export type DbChat = {
  id: string
  agentId: string
  title: string
  createdAt: number
  userId: string
  messages: Message[]
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

export type Agent = {
  id: string
  userId: string
  name: string
  description: string
  imageUrl: string
  creator: string
}

export type CreateAgentParams = {
  name: string
  userId: string
  description: string
  instructions: string
  creator: string
  imageUrl: string
}

export type GlobalConfig = {
  viemChain: Chain
  compilerVersion: string
  useWallet: boolean
}

export type DeployContractParams = {
  chainId: string
  contractName: string
  sourceCode: string
  constructorArgs: Array<string | string[]>
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
  verificationStatus: string
  transactionHash: Hash
}

export type DeployTokenScriptParams = {
  chainId: string
  tokenAddress: Hash
  tokenScriptSource: string
  tokenName: string
  ensDomain: string
  includeBurnFunction: boolean
}

export type DeployTokenScriptResult = {
  txHash: string
  explorerUrl: string
  ipfsUrl: string
  viewerUrl: string
  tokenName: string
  ensDomain: string
  includeBurnFunction: boolean
}
