"use server"

import { track } from "@vercel/analytics/server"
import { http, type Chain, createWalletClient, encodeFunctionData, parseAbiItem, publicActions } from "viem"

import { storeTokenScriptDeploymentAction } from "@/lib/actions"
import { ipfsUploadFile } from "@/lib/actions/ipfs"
import { DEPLOYER_ACCOUNT } from "@/lib/data/secrets"
import type { DeployTokenScriptParams, DeployTokenScriptResult } from "@/lib/types"
import { getExplorerUrl, getIpfsUrl } from "@/lib/utils"
import { FULL_RPC_URLS, getChainById } from "@/lib/viem"

export const deployTokenScript = async ({
  chainId,
  tokenAddress,
  tokenScriptSource,
  tokenName,
  ensDomain,
  includeBurnFunction
}: DeployTokenScriptParams): Promise<DeployTokenScriptResult> => {
  const viemChain = getChainById(Number(chainId)) as Chain

  const walletClient = createWalletClient({
    account: DEPLOYER_ACCOUNT,
    chain: viemChain,
    transport: http(FULL_RPC_URLS[viemChain.id])
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
      ""
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
    args: [ipfsRoute]
  })

  // Send transaction
  const txHash = await walletClient.sendTransaction({
    to: tokenAddress,
    data
  })

  const explorerUrl = getExplorerUrl({
    viemChain,
    hash: txHash,
    type: "tx"
  })

  // Wait for transaction confirmation
  const transactionReceipt = await walletClient.waitForTransactionReceipt({
    hash: txHash
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
    includeBurnFunction
  }

  await Promise.all([
    storeTokenScriptDeploymentAction({
      chainId,
      deployHash: txHash,
      cid,
      tokenAddress
    }),
    track("deployed_tokenscript", {
      tokenAddress,
      explorerUrl,
      cid
    })
  ])

  return deploymentData
}
