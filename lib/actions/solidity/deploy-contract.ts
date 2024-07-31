"use server"

import { track } from "@vercel/analytics/server"
import { http, type Chain, type Hex, createWalletClient, encodeDeployData } from "viem"
import { privateKeyToAccount } from "viem/accounts"

import { storeDeployment, storeVerification } from "@/lib/actions/db"
import { ipfsUpload } from "@/lib/actions/ipfs"
import { compileContract } from "@/lib/actions/solidity/compile-contract"
import { getContractFileName, getExplorerUrl, getIpfsUrl } from "@/lib/contracts/contract-utils"
import type { DeployContractParams, DeployContractResult, VerifyContractParams } from "@/lib/types"
import { getChainById } from "@/lib/viem"

export const deployContract = async ({
  chainId,
  contractName,
  sourceCode,
  constructorArgs
}: DeployContractParams): Promise<DeployContractResult> => {
  const viemChain = getChainById(Number(chainId)) as Chain

  const { abi, bytecode, standardJsonInput, sources } = await compileContract({ contractName, sourceCode })

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
    abi,
    bytecode,
    args: constructorArgs
  })

  const deployHash = await walletClient.deployContract({
    abi,
    bytecode,
    account,
    args: constructorArgs
  })

  const explorerUrl = getExplorerUrl(viemChain, deployHash)

  const cid = await ipfsUpload(sources, abi, bytecode, standardJsonInput)

  const ipfsUrl = getIpfsUrl(cid)

  const encodedConstructorArgs = deployData.slice(bytecode?.length) as `0x${string}`
  const fileName = getContractFileName(contractName)

  const verifyContractConfig: VerifyContractParams = {
    deployHash,
    standardJsonInput,
    encodedConstructorArgs,
    fileName,
    contractName,
    viemChain
  }

  const deploymentData: DeployContractResult = {
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
