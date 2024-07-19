import { NextResponse, type NextRequest } from "next/server"

import { ipfsUpload } from "@/lib/functions/deploy-contract/ipfs-upload"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  const json = await req.json()
  const { sources, abi, bytecode, standardJsonInput } = json
  try {
    const deployResult = await ipfsUpload(sources, JSON.stringify(abi), bytecode, standardJsonInput)

    return NextResponse.json(deployResult)
  } catch (error) {
    const err = error as Error
    console.error(`Error in verifyContract: ${err.message}`)
    return NextResponse.json(`Error in verifyContract: ${err.message}`)
  }
}
