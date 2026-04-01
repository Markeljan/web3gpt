import { useCallback } from "react"
import { toast } from "sonner"
import { type Abi, encodeDeployData, getCreateAddress, type Hash, publicActions } from "viem"
import { useAccount, useWalletClient } from "wagmi"
import { useGlobalStore } from "@/app/state/global-store"
import type { LastDeploymentData, VerifyContractParams } from "@/lib/types"
import { getExplorerUrl } from "@/lib/utils"

export function useWalletDeploy() {
  const { chain: viemChain, address, chainId } = useAccount()
  const { setLastDeploymentData } = useGlobalStore()
  const { data } = useWalletClient({
    chainId,
  })
  const walletClient = data?.extend(publicActions)

  const deploy = useCallback(
    async ({
      contractName,
      sourceCode,
      constructorArgs,
      imports,
    }: {
      contractName: string
      sourceCode: string
      constructorArgs: string[]
      imports?: Record<string, string>
    }) => {
      if (!(viemChain && walletClient && address && chainId)) {
        return
      }
      const deployLoadingToast = toast.loading("Deploying contract...")

      try {
        const prepareResponse = await fetch("/api/wallet-deploy/prepare", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            imports
              ? {
                  contractName,
                  sourceCode,
                  sources: imports,
                }
              : {
                  contractName,
                  sourceCode,
                }
          ),
        })
        const prepareResult = (await prepareResponse.json()) as {
          abi?: Abi
          artifactId?: string
          bytecode?: Hash
          error?: string
          standardJsonInput?: string
        }

        if (
          !(prepareResponse.ok && prepareResult.artifactId && prepareResult.bytecode && prepareResult.standardJsonInput)
        ) {
          throw new Error(prepareResult.error || "Failed to compile contract")
        }

        const { abi = [], artifactId, bytecode, standardJsonInput } = prepareResult

        const parsedConstructorArgs = constructorArgs.map((arg) => {
          if (arg.startsWith("[") && arg.endsWith("]") && arg.match(/(?<=\[)(?=[^"'])(.*)(?<=[^"'])(?=\])/g)) {
            return arg
              .slice(1, -1)
              .split(",")
              .map((item) => item.trim())
          }
          try {
            return JSON.parse(arg)
          } catch {
            return arg
          }
        })

        const nonce = await walletClient.getTransactionCount({ address })

        const contractAddress = getCreateAddress({
          from: address,
          nonce: BigInt(nonce),
        })

        const deployData = encodeDeployData({
          abi,
          bytecode,
          args: parsedConstructorArgs,
        })

        const deployHash = await walletClient.deployContract({
          abi,
          bytecode,
          account: address,
          args: parsedConstructorArgs,
          value: 0n,
        })

        if (!deployHash) {
          toast.error("Failed to deploy contract")
          return
        }

        const encodedConstructorArgs = deployData.slice(bytecode.length)
        const explorerUrl = getExplorerUrl({
          viemChain,
          hash: contractAddress,
          type: "address",
        })

        const transactionReceipt = await walletClient.waitForTransactionReceipt({
          hash: deployHash,
        })

        if (transactionReceipt.status !== "success") {
          toast.error("Failed to receive enough confirmations")
          return
        }

        const finalizeLoadingToast = toast.loading("Uploading to IPFS and queuing verification...")
        const finalizeResponse = await fetch("/api/wallet-deploy/finalize", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            artifactId,
            chainId,
            contractAddress,
            deployHash,
            deployerAddress: address,
            encodedConstructorArgs,
          }),
        })
        const finalizeResult = (await finalizeResponse.json()) as {
          error?: string
          explorerUrl?: string
          ipfsUrl?: string
          verifyContractConfig?: VerifyContractParams
        }
        toast.dismiss(finalizeLoadingToast)

        if (!(finalizeResponse.ok && finalizeResult.ipfsUrl && finalizeResult.verifyContractConfig)) {
          throw new Error(finalizeResult.error || "Contract deployed, but failed to persist metadata")
        }

        toast.success("Uploaded to IPFS successfully!")

        const deploymentData: LastDeploymentData = {
          walletAddress: address,
          contractAddress,
          chainId,
          transactionHash: deployHash,
          ipfsUrl: finalizeResult.ipfsUrl,
          explorerUrl: finalizeResult.explorerUrl || explorerUrl,
          verifyContractConfig: finalizeResult.verifyContractConfig,
          standardJsonInput,
          abi,
          sourceCode,
        }

        setLastDeploymentData(deploymentData)
        toast.success("Contract deployed successfully!")
        return deploymentData
      } catch (error) {
        const message = error instanceof Error ? error.message.split("\n")[0] : "Failed to deploy contract"
        toast.error(message)
      } finally {
        toast.dismiss(deployLoadingToast)
      }
    },
    [viemChain, walletClient, address, setLastDeploymentData, chainId]
  )

  return { deploy }
}
