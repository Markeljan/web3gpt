"use server"

import { track } from "@vercel/analytics/server"
import solc, { type SolcInput, type SolcOutput } from "solc"
import { http, type Chain, createWalletClient, encodeDeployData, getCreateAddress, publicActions } from "viem"

import { storeDeploymentAction, storeVerificationAction } from "@/lib/actions"
import { ipfsUploadDir } from "@/lib/actions/ipfs"
import { getContractFileName, prepareContractSources } from "@/lib/actions/solidity/utils"
import { DEPLOYER_ACCOUNT } from "@/lib/data/secrets"
import type { DeployContractParams, DeployContractResult, VerifyContractParams } from "@/lib/types"
import { ensureHashPrefix, getExplorerUrl, getIpfsUrl } from "@/lib/utils"
import { FULL_RPC_URLS, getChainById } from "@/lib/viem"

export const deployContract = async ({
  chainId,
  contractName,
  sourceCode,
  constructorArgs
}: DeployContractParams): Promise<DeployContractResult> => {
  const viemChain = getChainById(Number(chainId)) as Chain

  const { abi, bytecode, standardJsonInput, sources } = await compileContract({ contractName, sourceCode })

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

  const deployerAddress = DEPLOYER_ACCOUNT.address
  const nonce = await walletClient.getTransactionCount({ address: deployerAddress })

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
    storeDeploymentAction({
      chainId,
      deployHash,
      contractAddress,
      cid
    }),
    storeVerificationAction(verifyContractConfig),
    track("deployed_contract", {
      contractName,
      explorerUrl,
      contractAddress
    })
  ])

  return deploymentData
}

export async function compileContract({ contractName, sourceCode }: { contractName: string; sourceCode: string }) {
  const sources = await prepareContractSources(contractName, sourceCode)
  const standardJsonInputString = JSON.stringify({
    language: "Solidity",
    sources,
    settings: {
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
  } satisfies SolcInput)

  const fileName = getContractFileName(contractName)

  const compileOutput: SolcOutput = JSON.parse(solc.compile(standardJsonInputString))

  if (compileOutput.errors) {
    const errors = compileOutput.errors.filter((error) => error.severity === "error")
    if (errors.length > 0) {
      throw new Error(errors[0].formattedMessage)
    }
  }

  const contract = compileOutput.contracts[fileName][contractName]
  const abi = contract.abi
  const bytecode = ensureHashPrefix(contract.evm.bytecode.object)

  return {
    abi,
    bytecode,
    standardJsonInput: standardJsonInputString,
    sources
  }
}
