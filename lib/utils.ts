import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Chain, Hash } from "viem"

import { getChainDetails } from "@/lib/config"

export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs))

const SECOND_IN_MS = 1000

export const formatDate = (input: string | number | Date): string => {
  let date: Date

  if (typeof input === "number") {
    // treat 10 digit numbers as unix timestamps (seconds)
    if (input.toString().length === 10) {
      date = new Date(input * SECOND_IN_MS)
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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const isValidEmail = (email: string): boolean => {
  const regex = EMAIL_REGEX
  return regex.test(email)
}

export const getIpfsUrl = (cid: string): string => `${process.env.NEXT_PUBLIC_IPFS_GATEWAY}/ipfs/${cid}`

const HASH_PREFIX_REGEX = /^0x/
export function ensureHashPrefix(bytecode: string | Hash): Hash {
  return `0x${bytecode.replace(HASH_PREFIX_REGEX, "")}`
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
    return ""
  }
  if (type === "tx") {
    return `${explorerUrl}/tx/${hash}`
  }

  return `${explorerUrl}/address/${hash}`
}
