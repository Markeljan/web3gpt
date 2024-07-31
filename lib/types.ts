import type { Message } from "ai"
import type { Abi, Chain, Hash, Hex } from "viem"

export type ChatPageProps = {
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

export type ServerActionResult<Result> = Promise<
  | Result
  | {
      error: string
    }
>

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
  sourceCode: string
  explorerUrl: string
  ipfsUrl: string
  verifyContractConfig: VerifyContractParams
  abi: Abi
  standardJsonInput: string
}

export type VerifyContractParams = {
  deployHash: Hash
  standardJsonInput: string
  encodedConstructorArgs: string
  fileName: string
  contractName: string
  viemChain: Chain
}

export type LastDeploymentData = DeployContractResult & {
  address?: Hex
  verificationStatus: string
  transactionHash: Hex
}
