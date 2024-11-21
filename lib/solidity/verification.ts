"server-only"

import type { Chain } from "viem"

import { DEFAULT_COMPILER_VERSION, getChainDetails } from "@/lib/config"
import type { VerifyContractParams } from "@/lib/types"

export const verifyContract = async ({
  contractAddress,
  standardJsonInput,
  encodedConstructorArgs,
  fileName,
  contractName,
  viemChain,
}: VerifyContractParams): Promise<{ status: string; result: string }> => {
  const { explorerApiUrl, explorerApiKey } = getChainDetails(viemChain)

  const params = new URLSearchParams()
  params.append("module", "contract")
  params.append("action", "verifysourcecode")
  params.append("contractaddress", contractAddress)
  params.append("sourceCode", JSON.stringify(standardJsonInput))
  params.append("codeformat", "solidity-standard-json-input")
  params.append("contractname", `${fileName}:${contractName}`)
  params.append("compilerversion", DEFAULT_COMPILER_VERSION)
  if (encodedConstructorArgs) {
    params.append("constructorArguements", encodedConstructorArgs)
  }
  params.append("optimizationUsed", "1")
  params.append("runs", "200")
  params.append("licenseType", "mit")
  params.append("apikey", explorerApiKey)

  const response = await fetch(explorerApiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body: params.toString(),
  })

  if (!response.ok) {
    throw new Error(`Explorer API request failed with status ${response.status}`)
  }

  return await response.json()
}

export const checkVerifyStatus = async (
  guid: string,
  viemChain: Chain,
): Promise<{ status: string; result: string }> => {
  const { explorerApiUrl, explorerApiKey } = getChainDetails(viemChain)

  const params = new URLSearchParams()
  params.append("apikey", explorerApiKey)
  params.append("module", "contract")
  params.append("action", "checkverifystatus")
  params.append("guid", guid)

  const response = await fetch(explorerApiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body: params.toString(),
  })

  if (!response.ok) {
    throw new Error(`Explorer API request failed with status ${response.status}`)
  }

  return await response.json()
}
