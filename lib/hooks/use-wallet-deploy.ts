"use client"

import { track } from "@vercel/analytics"
import { toast } from "sonner"
import { encodeDeployData } from "viem"
import { useAccount, usePublicClient, useWalletClient } from "wagmi"

import { useGlobalStore } from "@/app/state/global-store"
import { storeDeployment, storeVerification } from "@/lib/actions/db"
import { compileContract } from "@/lib/actions/solidity/compile-contract"
import { getContractFileName, getExplorerUrl, getIpfsUrl } from "@/lib/contracts/contract-utils"
import type { LastDeploymentData, VerifyContractParams } from "@/lib/types"

export function useWalletDeploy() {
  const { chain: viemChain, address } = useAccount()
  const { setLastDeploymentData, setVerifyContractConfig, globalConfig } = useGlobalStore()
  const chainId = viemChain?.id || globalConfig.viemChain.id
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient({
    chainId
  })

  async function deploy({
    contractName,
    sourceCode,
    constructorArgs
  }: {
    contractName: string
    sourceCode: string
    constructorArgs: Array<string>
  }) {
    if (!viemChain || !walletClient) {
      throw new Error("Wallet not available")
    }

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

    const deployData = encodeDeployData({
      abi: abi,
      bytecode: bytecode,
      args: parsedConstructorArgs
    })

    const deployLoadingToast = toast.loading("Deploying contract...")
    const deployHash = await walletClient.deployContract({
      abi: abi,
      bytecode: bytecode,
      account: address,
      args: parsedConstructorArgs,
      value: 0n
    })

    if (!deployHash) {
      toast.dismiss(deployLoadingToast)
      toast.error("Failed to deploy contract")
      return
    }

    const ipfsLoadingToast = toast.loading("Uploading to IPFS...")
    const ipfsUploadResponse = await fetch("/api/ipfs-upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        sources,
        abi,
        bytecode,
        standardJsonInput
      })
    })

    const cid = await ipfsUploadResponse.json()

    toast.dismiss(ipfsLoadingToast)
    if (!cid) {
      toast.error("Failed to upload to IPFS")
    } else {
      toast.success("Uploaded to IPFS successfully!")
    }

    const ipfsUrl = getIpfsUrl(cid)

    const encodedConstructorArgs = deployData.slice(bytecode.length) as `0x${string}`
    const fileName = getContractFileName(contractName)

    const verifyContractConfig: VerifyContractParams = {
      deployHash,
      standardJsonInput,
      encodedConstructorArgs,
      fileName,
      contractName,
      viemChain
    }

    setVerifyContractConfig(verifyContractConfig)

    const explorerUrl = getExplorerUrl(viemChain, deployHash)

    await Promise.all([
      storeDeployment({
        chainId: chainId.toString(),
        deployHash,
        cid
      }),
      storeVerification(verifyContractConfig),
      track("deployed_contract", {
        contractName,
        explorerUrl
      })
    ])

    try {
      const transactionReceipt = await publicClient?.waitForTransactionReceipt({
        hash: verifyContractConfig.deployHash
      })

      const address = transactionReceipt?.contractAddress

      if (!address) {
        toast.dismiss(deployLoadingToast)
        toast.error("Contract deployment failed")
        return
      }

      const deploymentData: LastDeploymentData = {
        address,
        chainId,
        transactionHash: deployHash,
        ipfsUrl,
        explorerUrl,
        verifyContractConfig,
        verificationStatus: "pending",
        standardJsonInput,
        abi,
        sourceCode
      }

      setLastDeploymentData(deploymentData)
      toast.dismiss(deployLoadingToast)
      toast.success("Contract deployed successfully!")
      return deploymentData
    } catch (error) {
      console.error(error)
      toast.dismiss(deployLoadingToast)
      toast.error("Contract deployment failed")
      const deploymentData: LastDeploymentData = {
        transactionHash: deployHash,
        chainId,
        explorerUrl,
        ipfsUrl,
        verificationStatus: "pending",
        verifyContractConfig,
        standardJsonInput,
        abi,
        sourceCode
      }
      setLastDeploymentData(deploymentData)
      return deploymentData
    }
  }

  return { deploy }
}
