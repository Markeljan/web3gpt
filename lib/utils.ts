import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Chain, Hash } from "viem"

import { getChainDetails } from "@/lib/config"

export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs))

export const formatDate = (input: string | number | Date): string => {
  let date: Date

  if (typeof input === "number") {
    // treat 10 digit numbers as unix timestamps (seconds)
    if (input.toString().length === 10) {
      date = new Date(input * 1000)
    } else {
      // assume milliseconds
      date = new Date(input)
    }
  } else if (typeof input === "string") {
    date = new Date(input)
  } else if (input instanceof Date) {
    date = input
  } else {
    date = new Date()
  }

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export const isValidEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

export const getIpfsUrl = (cid: string): string => `${process.env.NEXT_PUBLIC_IPFS_GATEWAY}/ipfs/${cid}`

export function ensureHashPrefix(bytecode: string | Hash): Hash {
  return `0x${bytecode.replace(/^0x/, "")}`
}

export function getExplorerUrl({
  viemChain,
  hash,
  type,
}: {
  viemChain: Chain
  hash: Hash
  type: "tx" | "address"
}): string {
  const { explorerUrl } = getChainDetails(viemChain)
  if (!explorerUrl) {
    console.error(`No explorer URL found for chainId ${viemChain.id}`)
    return ""
  }
  if (type === "tx") return `${explorerUrl}/tx/${hash}`

  return `${explorerUrl}/address/${hash}`
}
