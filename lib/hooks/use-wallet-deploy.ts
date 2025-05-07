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
import { getDataSuffix, submitReferral } from "@divvi/referral-sdk"

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

        // Generate deployment calldata
        const deployData = encodeDeployData({
          abi,
          bytecode,
          args: parsedConstructorArgs,
        })

        // Get Divvi data suffix
        const dataSuffix = getDataSuffix({
          consumer: "0x42e9c498135431a48796B5fFe2CBC3d7A1811927",
          providers: ["0x5f0a55FaD9424ac99429f635dfb9bF20c3360Ab8", "0x6226ddE08402642964f9A6de844ea3116F0dFc7e"],
        })

        // Concatenate deployData and dataSuffix as hex strings
        const deployDataNo0x = deployData.startsWith("0x") ? deployData.slice(2) : deployData
        const dataSuffixNo0x = dataSuffix.startsWith("0x") ? dataSuffix.slice(2) : dataSuffix
        const fullCalldata = `0x${deployDataNo0x}${dataSuffixNo0x}` as `0x${string}`

        // Send the deployment transaction
        const txHash = await walletClient.sendTransaction({
          account: address,
          to: undefined, // contract creation
          data: fullCalldata,
          value: 0n,
        })

        // Get chain ID
        const sentChainId = await walletClient.getChainId()

        // Report to Divvi
        await submitReferral({
          txHash,
          chainId: sentChainId,
        })

        // Wait for transaction receipt
        const transactionReceipt = await walletClient.waitForTransactionReceipt({
          hash: txHash,
        })

        if (transactionReceipt.status !== "success") {
          toast.error("Failed to receive enough confirmations")
          return
        }

        // Derive contract address
        const nonce = await walletClient.getTransactionCount({ address })
        const contractAddress = getCreateAddress({
          from: address,
          nonce: BigInt(nonce - 1), // minus 1 because nonce was incremented after sending
        })

        // Upload to IPFS
        const ipfsLoadingToast = toast.loading("Uploading to IPFS...")
        const cid = await ipfsUploadDirAction(sources, abi, bytecode, standardJsonInput)
        toast.dismiss(ipfsLoadingToast)
        if (!cid) {
          toast.error("Failed to upload to IPFS")
          return
        }
        toast.success("Uploaded to IPFS successfully!")

        const ipfsUrl = getIpfsUrl(cid)
        const encodedConstructorArgs = deployData.slice(bytecode.length)
        const fileName = getContractFileName(contractName)

        const verifyContractConfig: VerifyContractParams = {
          deployHash: txHash,
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
            chainId: String(sentChainId),
            deployHash: txHash,
            contractAddress,
            cid,
          }),
          storeVerificationAction(verifyContractConfig),
          track("deployed_contract", {
            contractName,
            explorerUrl,
          }),
        ])

        const deploymentData: LastDeploymentData = {
          walletAddress: address,
          contractAddress,
          chainId: sentChainId,
          transactionHash: txHash,
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
