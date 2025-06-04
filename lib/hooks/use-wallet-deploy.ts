import { useCallback } from "react"

import { track } from "@vercel/analytics"
import { toast } from "sonner"
import { encodeDeployData, getCreateAddress, publicActions } from "viem"
import { useAccount, useWalletClient } from "wagmi"

import { useGlobalStore } from "@/app/state/global-store"
import { compileContract, ipfsUploadDirAction } from "@/lib/actions/deploy-contract"
import { storeDeploymentAction, storeVerificationAction } from "@/lib/actions/verification"
import { getContractFileName } from "@/lib/solidity/utils"
import type { LastDeploymentData, VerifyContractParams } from "@/lib/types"
import { getExplorerUrl, getIpfsUrl } from "@/lib/utils"

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
    }: {
      contractName: string
      sourceCode: string
      constructorArgs: Array<string>
    }) => {
      if (!viemChain || !walletClient || !address || !chainId) {
        return
      }
      const deployLoadingToast = toast.loading("Deploying contract...")

      try {
        const { abi, bytecode, standardJsonInput, sources } = await compileContract({ contractName, sourceCode })

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

        const ipfsLoadingToast = toast.loading("Uploading to IPFS...")
        const cid = await ipfsUploadDirAction(sources, abi, bytecode, standardJsonInput)

        if (!cid) {
          toast.dismiss(ipfsLoadingToast)
          toast.error("Failed to upload to IPFS")
          return
        }

        toast.dismiss(ipfsLoadingToast)
        if (!cid) {
          toast.error("Failed to upload to IPFS")
        } else {
          toast.success("Uploaded to IPFS successfully!")
        }

        const ipfsUrl = getIpfsUrl(cid)

        const encodedConstructorArgs = deployData.slice(bytecode.length)
        const fileName = getContractFileName(contractName)

        const verifyContractConfig: VerifyContractParams = {
          deployHash,
          contractAddress,
          standardJsonInput,
          encodedConstructorArgs,
          fileName,
          contractName,
          viemChain: {
            id: viemChain.id,
            name: viemChain.name,
            nativeCurrency: viemChain.nativeCurrency,
            rpcUrls: viemChain.rpcUrls,
            blockExplorers: viemChain.blockExplorers,
          },
        }

        const explorerUrl = getExplorerUrl({
          viemChain,
          hash: contractAddress,
          type: "address",
        })

        await Promise.all([
          storeDeploymentAction({
            chainId: String(chainId),
            deployHash,
            contractAddress,
            cid,
            ipfsUrl,
            contractName,
            deployerAddress: address,
          }),
          storeVerificationAction(verifyContractConfig),
          track("deployed_contract", {
            contractName,
            explorerUrl,
          }),
        ])

        const transactionReceipt = await walletClient.waitForTransactionReceipt({
          hash: deployHash,
        })

        if (transactionReceipt.status !== "success") {
          toast.error("Failed to receive enough confirmations")
          return
        }

        const deploymentData: LastDeploymentData = {
          walletAddress: address,
          contractAddress,
          chainId,
          transactionHash: deployHash,
          ipfsUrl,
          explorerUrl,
          verifyContractConfig,
          standardJsonInput,
          abi,
          sourceCode,
        }

        setLastDeploymentData(deploymentData)
        toast.success("Contract deployed successfully!")
        return deploymentData
      } catch (error) {
        console.error(error)
        toast.error("Failed to deploy contract")
      } finally {
        toast.dismiss(deployLoadingToast)
      }
    },
    [viemChain, walletClient, address, setLastDeploymentData, chainId],
  )

  return { deploy }
}
