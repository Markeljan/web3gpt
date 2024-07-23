"use server"

import { track } from "@vercel/analytics/server"

import solc from "solc"
import { type Chain, type Hex, createWalletClient, encodeDeployData, http } from "viem"
import { privateKeyToAccount } from "viem/accounts"

import type { DeployContractParams, DeployContractResult, VerifyContractParams } from "@/lib/functions/types"
import handleImports from "@/lib/functions/deploy-contract/handle-imports"
import { getChainById, getExplorerUrl } from "@/lib/viem-utils"
import { ipfsUpload } from "@/lib/functions/deploy-contract/ipfs-upload"
import { getGatewayUrl } from "@/lib/utils"
import { storeDeployment, storeVerification } from "@/lib/actions/db"

export const deployContract = async ({
  chainId,
  contractName,
  sourceCode,
  constructorArgs
}: DeployContractParams): Promise<DeployContractResult> => {
  const viemChain = getChainById(Number(chainId)) as Chain

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

  const output = JSON.parse(solc.compile(standardJsonInput))
  if (output.errors) {
    // Filter out warnings
    const errors = output.errors.filter((error: { severity: string }) => error.severity === "error")
    if (errors.length > 0) {
      const error = new Error(errors[0].formattedMessage)
      throw error
    }
  }
  const contract = output.contracts[fileName]

  // Get the contract ABI and bytecode
  const abi = contract[contractName].abi
  let bytecode = contract[contractName].evm.bytecode.object
  if (!bytecode.startsWith("0x")) {
    bytecode = `0x${bytecode}`
  }

  const deployerPk: Hex = `0x${process.env.DEPLOYER_PRIVATE_KEY}`
  const account = privateKeyToAccount(deployerPk)

  const alchemyHttpUrl = viemChain?.rpcUrls?.alchemy?.http[0]
    ? `${viemChain.rpcUrls.alchemy.http[0]}/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
    : undefined

  const walletClient = createWalletClient({
    account,
    chain: viemChain,
    transport: http(alchemyHttpUrl)
  })

  if (!(await walletClient.getAddresses())) {
    const error = new Error(`Wallet for chain ${viemChain.name} not available`)
    console.error(error)
  }

  const deployData = encodeDeployData({
    abi: abi,
    bytecode: bytecode,
    args: constructorArgs
  })

  const deployHash = await walletClient.deployContract({
    abi: abi,
    bytecode: bytecode,
    account: account,
    args: constructorArgs
  })

  const explorerUrl = `${getExplorerUrl(viemChain)}/tx/${deployHash}`

  const cid = await ipfsUpload(sources, JSON.stringify(abi), bytecode, standardJsonInput)

  const ipfsUrl = getGatewayUrl(cid)

  const encodedConstructorArgs = deployData.slice(bytecode?.length)

  const verifyContractConfig: VerifyContractParams = {
    deployHash,
    standardJsonInput,
    encodedConstructorArgs,
    fileName,
    contractName,
    viemChain
  }

  const deploymentData = {
    sourceCode,
    explorerUrl,
    ipfsUrl,
    verifyContractConfig,
    abi,
    standardJsonInput
  }

  // store deployment, verificationData, track
  await Promise.all([
    storeDeployment({
      chainId,
      deployHash,
      cid
    }),
    storeVerification(verifyContractConfig),
    track("deployed_contract", {
      contractName,
      explorerUrl
    })
  ])

  return deploymentData
}
