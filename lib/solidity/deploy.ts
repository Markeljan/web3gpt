import "server-only"
import { track } from "@vercel/analytics/server"
import { createWalletClient, encodeDeployData, getCreateAddress, http, publicActions } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { compileContract } from "@/lib/actions/deploy-contract"
import { storeDeploymentAction, storeVerificationAction } from "@/lib/actions/verification"
import { getChainById, getChainDetails } from "@/lib/config"
import { ipfsUploadDir } from "@/lib/data/ipfs"
import { getContractFileName } from "@/lib/solidity/utils"
import type { DeployContractParams, DeployContractResult, VerifyContractParams } from "@/lib/types"
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
    args: constructorArgs,
    bytecode,
  })

  const deployHash = await walletClient.deployContract({
    abi,
    account: DEPLOYER_ACCOUNT,
    args: constructorArgs,
    bytecode,
  })

  const explorerUrl = getExplorerUrl({
    hash: contractAddress,
    type: "address",
    viemChain,
  })

  const cid = await ipfsUploadDir(sources, abi, bytecode, standardJsonInput)
  if (!cid) {
    throw new Error("Error uploading to IPFS")
  }

  const ipfsUrl = getIpfsUrl(cid)

  const encodedConstructorArgs = deployData.slice(bytecode?.length)
  const fileName = getContractFileName(contractName)

  const verifyContractConfig: VerifyContractParams = {
    contractAddress,
    contractName,
    deployHash,
    encodedConstructorArgs,
    fileName,
    standardJsonInput,
    viemChain,
  }

  const deploymentData: DeployContractResult = {
    abi,
    contractAddress,
    explorerUrl,
    ipfsUrl,
    sourceCode,
    standardJsonInput,
    verifyContractConfig,
  }

  await Promise.all([
    storeDeploymentAction({
      chainId,
      cid,
      contractAddress,
      contractName,
      deployerAddress,
      deployHash,
    }),
    storeVerificationAction(verifyContractConfig),
    track("deployed_contract", {
      contractAddress,
      contractName,
      explorerUrl,
    }),
  ])

  return deploymentData
}
