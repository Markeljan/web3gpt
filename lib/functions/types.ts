import { Chain, Hex } from 'viem'

export type GlobalConfig = {
  viemChain: Chain
  solidityVersion: string
  evmVersion: string
  useWallet: boolean
}

export type DeployContractParams = {
  chainId: string
  contractName: string
  sourceCode: string
  constructorArgs: Array<string | string[]>
  evmVersion: string
}

export type DeployContractResult = {
  explorerUrl: string
  ipfsUrl: string
}

export type VerifyContractParams = {
  deployHash: Hex
  standardJsonInput: string
  encodedConstructorArgs: string
  fileName: string
  contractName: string
  viemChain: Chain
}

export type VerifyContractResult = {
  address: Hex
  standardJsonInput: string
  compilerVersion: string
  encodedConstructorArgs: string
  fileName: string
  contractName: string
  viemChain: Chain
}
