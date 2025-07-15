"use client"

import Link from "next/link"
import { metisSepolia } from "viem/chains"
import { useAccount } from "wagmi"
import { Button } from "@/components/ui/button"

export const MetisTeaser = () => {
  const { chain } = useAccount()

  if (chain?.id !== metisSepolia.id) {
    return null
  }

  return (
    <Button
      asChild
      className="bg-gradient-to-r from-purple-600 via-blue-500 to-indigo-400 hover:from-purple-700 hover:via-blue-600 hover:to-indigo-500 text-white font-bold py-2 px-4 rounded-full shadow-lg transform hover:scale-105 transition duration-300 ease-in-out"
    >
      <Link href="https://metis.fun" target="_blank">
        <span className="relative z-10">FUN</span>
        <div className="absolute inset-0 bg-black opacity-10 rounded-full" />
        <div className="absolute inset-0 animate-pulse bg-white opacity-10 rounded-full" />
      </Link>
    </Button>
  )
}
