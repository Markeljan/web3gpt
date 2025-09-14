"server-only"

import { track } from "@vercel/analytics/server"
import {
  createWalletClient,
  encodeDeployData,
  encodeFunctionData,
  getCreateAddress,
  http,
  parseAbiItem,
  publicActions,
} from "viem"
import { privateKeyToAccount } from "viem/accounts"

import { compileContract, storeTokenScriptDeploymentAction } from "@/lib/actions/deploy-contract"
import { storeDeploymentAction, storeVerificationAction } from "@/lib/actions/verification"
import { getChainById, getChainDetails } from "@/lib/config"
import { ipfsUploadDir, ipfsUploadFile } from "@/lib/data/ipfs"
import { getContractFileName } from "@/lib/solidity/utils"
import type {
  DeployContractParams,
  DeployContractResult,
  DeployTokenScriptParams,
  DeployTokenScriptResult,
  VerifyContractParams,
} from "@/lib/types"
import { getExplorerUrl, getIpfsUrl } from "@/lib/utils"

const DEPLOYER_ACCOUNT = privateKeyToAccount(`0x${process.env.DEPLOYER_PRIVATE_KEY}`)

export const deployContract = async ({
  chainId,
  contractName,
  sourceCode,
  constructorArgs,
  imports,
}: DeployContractParams): Promise<DeployContractResult> => {
  const viemChain = getChainById(Number(chainId))

  if (!viemChain) {
    throw new Error(`Chain ${chainId} not found`)
  }

  const { abi, bytecode, standardJsonInput, sources } = await compileContract({
    contractName,
    sourceCode,
    sources: imports,
  })

  const walletClient = createWalletClient({
    account: DEPLOYER_ACCOUNT,
    chain: viemChain,
    transport: http(getChainDetails(viemChain).rpcUrl),
  }).extend(publicActions)

  if (!(await walletClient.getAddresses())) {
    const error = new Error(`Wallet for chain ${viemChain.name} not available`)
    console.error(error)
    throw error
  }

  const deployerAddress = DEPLOYER_ACCOUNT.address
  const nonce = await walletClient.getTransactionCount({ address: deployerAddress })

  const contractAddress = getCreateAddress({
    from: deployerAddress,
    nonce: BigInt(nonce),
  })

  const deployData = encodeDeployData({
    abi,
    bytecode,
    args: constructorArgs,
  })

  const deployHash = await walletClient.deployContract({
    abi,
    bytecode,
    account: DEPLOYER_ACCOUNT,
    args: constructorArgs,
  })

  const explorerUrl = getExplorerUrl({
    viemChain,
    hash: contractAddress,
    type: "address",
  })

  const cid = await ipfsUploadDir(sources, abi, bytecode, standardJsonInput)
  if (!cid) {
    throw new Error("Error uploading to IPFS")
  }

  const ipfsUrl = getIpfsUrl(cid)

  const encodedConstructorArgs = deployData.slice(bytecode?.length)
  const fileName = getContractFileName(contractName)

  const verifyContractConfig: VerifyContractParams = {
    deployHash,
    contractAddress,
    standardJsonInput,
    encodedConstructorArgs,
    fileName,
    contractName,
    viemChain,
  }

  const deploymentData: DeployContractResult = {
    contractAddress,
    sourceCode,
    explorerUrl,
    ipfsUrl,
    verifyContractConfig,
    abi,
    standardJsonInput,
  }

  await Promise.all([
    storeDeploymentAction({
      chainId,
      deployHash,
      contractAddress,
      cid,
      contractName,
      deployerAddress,
    }),
    storeVerificationAction(verifyContractConfig),
    track("deployed_contract", {
      contractName,
      explorerUrl,
      contractAddress,
    }),
  ])

  return deploymentData
}

export const deployTokenScript = async ({
  chainId,
  tokenAddress,
  tokenScriptSource,
  tokenName,
  ensDomain,
  includeBurnFunction,
}: DeployTokenScriptParams): Promise<DeployTokenScriptResult> => {
  const viemChain = getChainById(Number(chainId))

  if (!viemChain) {
    throw new Error(`Chain ${chainId} not found`)
  }

  const walletClient = createWalletClient({
    account: DEPLOYER_ACCOUNT,
    chain: viemChain,
    transport: http(getChainDetails(viemChain).rpcUrl),
  }).extend(publicActions)

  if (!(await walletClient.getAddresses())) {
    const error = new Error(`Wallet for chain ${viemChain.name} not available`)
    console.error(error)
    throw error
  }

  // Prepare TokenScript
  let updatedTokenScriptSource = tokenScriptSource
    .replace(/TOKEN_NAME/g, tokenName)
    .replace(/CHAIN_ID/g, chainId)
    .replace(/CONTRACT_ADDRESS/g, tokenAddress)

  if (ensDomain) {
    updatedTokenScriptSource = updatedTokenScriptSource.replace(/ENS_DOMAIN/g, ensDomain)
  }

  if (!includeBurnFunction) {
    // Remove burn card if not requested
    updatedTokenScriptSource = updatedTokenScriptSource.replace(
      /<ts:card type="action" name="burn"[\s\S]*?<\/ts:card>/,
      "",
    )
  }

  // Upload TokenScript to IPFS
  const cid = await ipfsUploadFile("tokenscript.tsml", updatedTokenScriptSource)
  if (!cid) {
    throw new Error("Error uploading to IPFS")
  }

  const ipfsUrl = getIpfsUrl(cid)
  const ipfsRoute = [`ipfs://${cid}`]

  // Prepare transaction to update scriptURI
  const setScriptURIAbi = parseAbiItem("function setScriptURI(string[] memory newScriptURI)")
  const data = encodeFunctionData({
    abi: [setScriptURIAbi],
    functionName: "setScriptURI",
    args: [ipfsRoute],
  })

  // Send transaction
  const txHash = await walletClient.sendTransaction({
    to: tokenAddress,
    data,
  })

  const explorerUrl = getExplorerUrl({
    viemChain,
    hash: txHash,
    type: "tx",
  })

  // Wait for transaction confirmation
  const transactionReceipt = await walletClient.waitForTransactionReceipt({
    hash: txHash,
  })

  if (!transactionReceipt) {
    throw new Error("Failed to receive transaction confirmation")
  }

  // Generate viewer URL
  const viewerUrl = `https://viewer.tokenscript.org/?chain=${chainId}&contract=${tokenAddress}`

  const deploymentData: DeployTokenScriptResult = {
    txHash,
    explorerUrl,
    ipfsUrl,
    viewerUrl,
    tokenName,
    ensDomain,
    includeBurnFunction,
  }

  await Promise.all([
    storeTokenScriptDeploymentAction({
      chainId,
      deployHash: txHash,
      cid,
      tokenAddress,
    }),
    track("deployed_tokenscript", {
      tokenAddress,
      explorerUrl,
      cid,
    }),
  ])

  return deploymentData
}
