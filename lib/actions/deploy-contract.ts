"use server"

import { kv } from "@vercel/kv"
import solc, { type SolcInput, type SolcOutput } from "solc"
import type { Abi } from "viem"
import { withUser } from "@/lib/data/kv"
import { ipfsUploadDir, ipfsUploadFile } from "@/lib/data/ipfs"
import { getContractFileName, prepareContractSources } from "@/lib/solidity/utils"
import { ensureHashPrefix } from "@/lib/utils"

export async function compileContract({ contractName, sourceCode }: { contractName: string; sourceCode: string }) {
  const sources = await prepareContractSources(contractName, sourceCode)
  const standardJsonInputString = JSON.stringify({
    language: "Solidity",
    sources,
    settings: {
      outputSelection: {
        "*": {
          "*": ["*"],
        },
      },
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
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
    sources,
  }
}

export const storeTokenScriptDeploymentAction = withUser<
  {
    chainId: string
    deployHash: string
    cid: string
    tokenAddress: string
  },
  void
>(async (data, userId) => {
  await kv.hmset(`tokenscript:${data.cid}`, data)

  await kv.zadd(`user:tokenscripts:${userId}`, {
    score: Date.now(),
    member: `tokenscript:${data.cid}`,
  })
})

export async function ipfsUploadFileAction(fileName: string, fileContent: string | Buffer): Promise<string | null> {
  return await ipfsUploadFile(fileName, fileContent)
}

export async function ipfsUploadDirAction(
  sources: SolcOutput["sources"],
  abi: Abi,
  bytecode: string,
  standardJsonInput: string,
) {
  return await ipfsUploadDir(sources, abi, bytecode, standardJsonInput)
}
