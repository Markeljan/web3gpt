import { useGlobalStore } from "@/app/state/global-store"
import type { DeployContractParams, DeployContractResult } from "@/lib/functions/types"
import toast from "react-hot-toast"
import { usePublicClient } from "wagmi"

export function useW3GPTDeploy({ chainId }: { chainId: number }) {
  const { setIsDeploying, setLastDeploymentData, setVerifyContractConfig } = useGlobalStore()

  const publicClient = usePublicClient({
    chainId
  })

  async function deploy(_deployContractConfig?: DeployContractParams) {
    setIsDeploying(true)

    const deployContractResponse = await toast.promise(
      fetch("/api/deploy-contract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(_deployContractConfig)
      }),
      {
        loading: "Sending deploy transaction...",
        success: "Deploy transaction submitted!",
        error: "Failed to send deploy transaction"
      }
    )

    setIsDeploying(false)

    if (deployContractResponse.ok) {
      const {
        explorerUrl: txHashExplorerUrl,
        ipfsUrl,
        verifyContractConfig,
        abi,
        sourceCode,
        standardJsonInput
      }: DeployContractResult = await deployContractResponse.json()

      setVerifyContractConfig(verifyContractConfig)

      try {
        const transactionReceipt =
          publicClient &&
          (await toast.promise(
            publicClient.waitForTransactionReceipt({
              hash: verifyContractConfig?.deployHash
            }),
            {
              loading: "Waiting for confirmations...",
              success: "Transaction confirmed!",
              error: "Failed to receive enough confirmations"
            }
          ))

        const address = transactionReceipt?.contractAddress || undefined
        const explorerUrl = `${txHashExplorerUrl.split("/tx")[0]}/address/${address}`

        const deploymentData = {
          explorerUrl,
          ipfsUrl,
          verificationStatus: "pending",
          address: address,
          sourceCode,
          abi,
          transactionHash: verifyContractConfig?.deployHash,
          standardJsonInput
        }
        setLastDeploymentData(deploymentData)
        return deploymentData
      } catch (e) {
        const deploymentData = {
          explorerUrl: txHashExplorerUrl,
          ipfsUrl,
          verificationStatus: "pending",
          sourceCode,
          abi,
          transactionHash: verifyContractConfig?.deployHash,
          standardJsonInput
        }
        setLastDeploymentData(deploymentData)
        return deploymentData
      }
    } else {
      return {
        error: `Failed to deploy contract:${(await deployContractResponse.json()).error}`
      }
    }
  }

  return { deploy }
}
