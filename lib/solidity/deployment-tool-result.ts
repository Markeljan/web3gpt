import type { DeployContractResult } from "@/lib/types"

type AgentDeploymentResult = Pick<
  DeployContractResult,
  "chainId" | "contractAddress" | "explorerUrl" | "ipfsUrl" | "transactionExplorerUrl" | "transactionHash"
>

export const formatDeploymentToolResult = ({
  chainId,
  contractAddress,
  explorerUrl,
  ipfsUrl,
  transactionExplorerUrl,
  transactionHash,
}: AgentDeploymentResult): string =>
  [
    `Contract deployed on chain ID ${chainId}.`,
    `Contract address: ${contractAddress}.`,
    `Contract explorer URL: ${explorerUrl}.`,
    `Transaction hash: ${transactionHash}.`,
    `Transaction explorer URL: ${transactionExplorerUrl}.`,
    `IPFS repository: ${ipfsUrl}.`,
    "Verification queued for explorer verification.",
  ].join(" ")
