import { encodeDeployData } from "viem"
import { toast } from "sonner"

import type { VerifyContractParams } from "@/lib/functions/types"
import handleImports from "@/lib/functions/deploy-contract/handle-imports"
import { getExplorerUrl } from "@/lib/viem-utils"
import { useAccount, usePublicClient, useWalletClient } from "wagmi"
import { useGlobalStore } from "@/app/state/global-store"
import { track } from "@vercel/analytics"

export function useDeployWithWallet() {
  const { chain: viemChain } = useAccount()
  const { data: walletClient } = useWalletClient()
  const { setLastDeploymentData, setVerifyContractConfig, globalConfig } = useGlobalStore()
  const publicClient = usePublicClient({
    chainId: viemChain?.id || globalConfig.viemChain.id
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
    const fileName = `${contractName.replace(/[\/\\:*?"<>|.\s]+$/g, "_")}.sol`

    // Prepare the sources object for the Solidity compiler
    const handleImportsResult = await handleImports(sourceCode)

    const sources = {
      [fileName]: {
        content: handleImportsResult?.sourceCode
      },
      ...handleImportsResult?.sources
    }
    const sourcesKeys = Object.keys(sources)

    // Loop over each source
    for (const sourceKey of sourcesKeys) {
      let sourceCode = sources[sourceKey].content

      // Find all import statements in the source code
      const importStatements = sourceCode.match(/import\s+["'][^"']+["'];/g) || []

      // Loop over each import statement
      for (const importStatement of importStatements) {
        // Extract the file name from the import statement
        const importPathMatch = importStatement.match(/["']([^"']+)["']/)

        // If no import path is found, continue to the next statement
        if (!importPathMatch) continue

        // Extract the file name from the path
        const importPath = importPathMatch[1]
        const fileName = importPath.split("/").pop() || importPath

        // Check if the file is already in the sources object
        // if (sources[fileName]) continue;

        // Replace the import statement with the new import statement
        sourceCode = sourceCode.replace(importStatement, `import "${fileName}";`)
      }

      // Update the source content in your sources object
      sources[sourceKey].content = sourceCode
    }

    // Compile the contract
    const standardJsonInput = JSON.stringify({
      language: "Solidity",
      sources,
      settings: {
        // evmVersion: "paris",
        outputSelection: {
          "*": {
            "*": ["*"]
          }
        },
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    })

    const compileContractResponse = await fetch("/api/compile-contract", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        standardJsonInput,
        contractName
      })
    })

    const compileResult = await compileContractResponse.json()
    const { abi, bytecode } = compileResult

    const parsedConstructorArgs = constructorArgs.map((arg) => {
      if (arg.startsWith("[") && arg.endsWith("]")) {
        // Check if the string doesn't have double or single quotes after '[' and before ']'
        if (arg.match(/(?<=\[)(?=[^"'])(.*)(?<=[^"'])(?=\])/g)) {
          // Split the string by commas and remove the brackets
          const elements = arg.slice(1, -1).split(",")

          // Trim each element to remove extra spaces and return as an array
          return elements.map((item) => item.trim())
        }
      }

      // Try parsing as JSON, or return the original argument
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

    const [account] = await walletClient.getAddresses()

    const deployLoadingToast = toast.loading("Deploying contract...")
    const deployHash = await walletClient.deployContract({
      abi: abi,
      bytecode: bytecode,
      account: account,
      args: parsedConstructorArgs
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

    const ipfsCid = await ipfsUploadResponse.json()
    const ipfsUrl = `https://nftstorage.link/ipfs/${ipfsCid}`

    toast.dismiss(ipfsLoadingToast)
    if (!ipfsCid) {
      toast.error("Failed to upload to IPFS")
    } else {
      toast.success("Uploaded to IPFS successfully!")
    }

    const encodedConstructorArgs = deployData.slice(bytecode.length)

    const verifyContractConfig: VerifyContractParams = {
      deployHash,
      standardJsonInput,
      encodedConstructorArgs,
      fileName,
      contractName,
      viemChain
    }

    setVerifyContractConfig(verifyContractConfig)

    const txHashExplorerUrl = `${getExplorerUrl(viemChain)}/tx/${deployHash}`

    track("deployed_contract", {
      contractName,
      explorerUrl: txHashExplorerUrl
    })

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

      const deploymentData = {
        address,
        transactionHash: deployHash,
        ipfsUrl,
        explorerUrl: txHashExplorerUrl,
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
      const deploymentData = {
        transactionHash: deployHash,
        explorerUrl: txHashExplorerUrl,
        ipfsUrl,
        verificationStatus: "pending",
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
