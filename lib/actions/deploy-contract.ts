"use server"
import type { SolcOutput } from "solc"
import type { Abi } from "viem"
import { ipfsUploadDir, ipfsUploadFile } from "@/lib/data/ipfs"
import { compileContractSource } from "@/lib/solidity/compile"

export async function compileContract({
  contractName,
  sourceCode,
  sources: additionalSources,
}: {
  contractName: string
  sourceCode: string
  sources?: Record<string, string>
}) {
  return await compileContractSource({
    contractName,
    sourceCode,
    sources: additionalSources,
  })
}

export async function ipfsUploadFileAction(fileName: string, fileContent: string): Promise<string | null> {
  return await ipfsUploadFile(fileName, fileContent)
}

export async function ipfsUploadDirAction(
  sources: SolcOutput["sources"],
  abi: Abi,
  bytecode: string,
  standardJsonInput: string
) {
  return await ipfsUploadDir(sources, abi, bytecode, standardJsonInput)
}
