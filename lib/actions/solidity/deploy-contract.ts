"use server"

import { track } from "@vercel/analytics/server"
import { http, type Chain, createWalletClient, encodeDeployData, getCreateAddress, createPublicClient } from "viem"

import { storeDeployment, storeVerification } from "@/lib/actions/db"
import { ipfsUploadDir } from "@/lib/actions/ipfs"
import { compileContract } from "@/lib/actions/solidity/compile-contract"
import { getContractFileName, getExplorerUrl, getIpfsUrl } from "@/lib/contracts/contract-utils"
import type { DeployContractParams, DeployContractResult, VerifyContractParams } from "@/lib/types"
import { getChainById } from "@/lib/viem"
import { DEPLOYER_ACCOUNT } from "@/lib/config-server"

export const deployContract = async ({
  chainId,
  contractName,
  sourceCode,
  constructorArgs
}: DeployContractParams): Promise<DeployContractResult> => {
  const viemChain = getChainById(Number(chainId)) as Chain

  const { abi, bytecode, standardJsonInput, sources } = await compileContract({ contractName, sourceCode })

  const alchemyHttpUrl = viemChain?.rpcUrls?.alchemy?.http[0]
    ? `${viemChain.rpcUrls.alchemy.http[0]}/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
    : undefined

  const walletClient = createWalletClient({
    account: DEPLOYER_ACCOUNT,
    chain: viemChain,
    transport: http(alchemyHttpUrl)
  })

  const publicClient = createPublicClient({
    chain: viemChain,
    transport: http(alchemyHttpUrl)
  })

  if (!(await walletClient.getAddresses())) {
    const error = new Error(`Wallet for chain ${viemChain.name} not available`)
    console.error(error)
    throw error
  }

  const deployerAddress = DEPLOYER_ACCOUNT.address
  const nonce = await publicClient.getTransactionCount({ address: deployerAddress })

  const contractAddress = getCreateAddress({
    from: deployerAddress,
    nonce: BigInt(nonce)
  })

  const deployData = encodeDeployData({
    abi,
    bytecode,
    args: constructorArgs
  })

  const deployHash = await walletClient.deployContract({
    abi,
    bytecode,
    account: DEPLOYER_ACCOUNT,
    args: constructorArgs
  })

  const explorerUrl = getExplorerUrl({
    viemChain,
    hash: contractAddress,
    type: "address"
  })

  const cid = await ipfsUploadDir(sources, abi, bytecode, standardJsonInput)
  if (!cid) {
    throw new Error("Error uploading to IPFS")
  }

  const ipfsUrl = getIpfsUrl(cid)

  const encodedConstructorArgs = deployData.slice(bytecode?.length) as `0x${string}`
  const fileName = getContractFileName(contractName)

  const verifyContractConfig: VerifyContractParams = {
    deployHash,
    contractAddress,
    standardJsonInput,
    encodedConstructorArgs,
    fileName,
    contractName,
    viemChain
  }

  const deploymentData: DeployContractResult = {
    contractAddress,
    sourceCode,
    explorerUrl,
    ipfsUrl,
    verifyContractConfig,
    abi,
    standardJsonInput
  }

  await Promise.all([
    storeDeployment({
      chainId,
      deployHash,
      contractAddress,
      cid
    }),
    storeVerification(verifyContractConfig),
    track("deployed_contract", {
      contractName,
      explorerUrl,
      contractAddress
    })
  ])

  return deploymentData
}
