import { type ClassValue, clsx } from "clsx"
import { customAlphabet } from "nanoid"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", 7)

export function formatDate(input: string | number | Date): string {
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

export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

export const getGatewayUrl = (cid: string) => `https://ipfs.io/ipfs/${cid}`
