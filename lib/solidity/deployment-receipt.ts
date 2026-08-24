import type { Hash } from "viem"

type DeploymentReceipt = {
  contractAddress?: Hash | null
  status: "reverted" | "success"
  transactionHash: Hash
}

export const getDeployedContractAddress = (receipt: DeploymentReceipt, chainName: string): Hash => {
  if (receipt.status !== "success") {
    throw new Error(`Contract deployment transaction ${receipt.transactionHash} reverted on ${chainName}`)
  }

  if (!receipt.contractAddress) {
    throw new Error(`Transaction ${receipt.transactionHash} did not create a contract on ${chainName}`)
  }

  return receipt.contractAddress
}
