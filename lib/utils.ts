import { type ClassValue, clsx } from "clsx"
import { customAlphabet } from "nanoid"
import { twMerge } from "tailwind-merge"
import type { Chain, Hash } from "viem"

import { IPFS_GATEWAY } from "@/lib/config"
import { resolveImports } from "@/lib/contracts/resolve-imports"
import { getExplorerDetails } from "@/lib/viem"

export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs))

export const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", 7)

export const formatDate = (input: string | number | Date): string => {
  let date: Date
  if (typeof input === "number") {
    if (input.toString().length === 10) {
      date = new Date(input * 1000)
    }
  }
  if (typeof input === "string") {
    date = new Date(input)
  }
  if (input instanceof Date) {
    date = input
  } else {
    date = new Date()
  }

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  })
}

export const isValidEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

export const getIpfsUrl = (cid: string): string => `${IPFS_GATEWAY}/ipfs/${cid}`

export function ensureHashPrefix(bytecode: string | Hash): Hash {
  return `0x${bytecode.replace(/^0x/, "")}`
}

export function getExplorerUrl({
  viemChain,
  hash,
  type
}: {
  viemChain: Chain
  hash: Hash
  type: "tx" | "address"
}): string {
  const { url } = getExplorerDetails(viemChain) || {}
  if (!url) return ""
  if (type === "tx") {
    return `${url}/tx/${hash}`
  }

  return `${url}/address/${hash}`
}

export const getContractFileName = (contractName: string): string => {
  return `${contractName.replace(/[\/\\:*?"<>|.\s]+$/g, "_")}.sol`
}

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
