import type { Chain, Hash } from "viem"

import { resolveImports } from "@/lib/contracts/resolve-imports"
import { getGatewayUrl } from "@/lib/utils"
import { getExplorerDetails } from "@/lib/viem"

export async function prepareContractSources(contractName: string, sourceCode: string) {
  const fileName = getContractFileName(contractName)

  const handleImportsResult = await resolveImports(sourceCode)

  const sources = {
    [fileName]: {
      content: handleImportsResult?.sourceCode
    },
    ...handleImportsResult?.sources
  }

  const sourcesKeys = Object.keys(sources)

  for (const sourceKey of sourcesKeys) {
    let sourceCode = sources[sourceKey].content
    const importStatements = sourceCode.match(/import\s+["'][^"']+["'];/g) || []

    for (const importStatement of importStatements) {
      const importPathMatch = importStatement.match(/["']([^"']+)["']/)
      if (!importPathMatch) continue

      const importPath = importPathMatch[1]
      const fileName = importPath.split("/").pop() || importPath
      sourceCode = sourceCode.replace(importStatement, `import "${fileName}";`)
    }

    sources[sourceKey].content = sourceCode
  }

  return sources
}

export function getExplorerUrl({
  viemChain,
  hash,
  type
}: {
  viemChain: Chain
  hash: Hash
  type: "tx" | "address"
}) {
  const { url } = getExplorerDetails(viemChain)
  if (type === "tx") {
    return `${url}/tx/${hash}`
  }

  return `${url}/address/${hash}`
}

export function getIpfsUrl(cid: string) {
  return getGatewayUrl(cid)
}

export const getContractFileName = (contractName: string) => `${contractName.replace(/[\/\\:*?"<>|.\s]+$/g, "_")}.sol`
