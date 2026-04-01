import "server-only"
import solc, { type SolcInput, type SolcInputSources, type SolcOutput } from "solc"
import type { Abi, Hash } from "viem"
import { getContractFileName, prepareContractSources } from "@/lib/solidity/utils"
import { ensureHashPrefix } from "@/lib/utils"

export type CompiledContract = {
  abi: Abi
  bytecode: Hash
  standardJsonInput: string
  sources: SolcInputSources
}

export async function compileContractSource({
  contractName,
  sourceCode,
  sources: additionalSources,
}: {
  contractName: string
  sourceCode: string
  sources?: Record<string, string>
}): Promise<CompiledContract> {
  const sources = await prepareContractSources(contractName, sourceCode, additionalSources)
  const standardJsonInput = JSON.stringify({
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
  const compileOutput: SolcOutput = JSON.parse(solc.compile(standardJsonInput))

  if (compileOutput.errors) {
    const errors = compileOutput.errors.filter((error) => error.severity === "error")
    if (errors.length > 0) {
      throw new Error(errors[0].formattedMessage)
    }
  }

  const contract = compileOutput.contracts[fileName]?.[contractName]
  if (!contract) {
    throw new Error(`Compiled contract ${contractName} was not found in ${fileName}`)
  }

  return {
    abi: contract.abi,
    bytecode: ensureHashPrefix(contract.evm.bytecode.object),
    standardJsonInput,
    sources,
  }
}
