import { type ClassValue, clsx } from "clsx"
import { customAlphabet } from "nanoid"
import { twMerge } from "tailwind-merge"
import type { Chain, Hash } from "viem"

import { IPFS_GATEWAY } from "@/lib/config"
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
