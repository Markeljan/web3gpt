import { type NextRequest, NextResponse } from "next/server"

import { ipfsUploadDir } from "@/lib/actions/ipfs"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  const json = await req.json()
  const { sources, abi, bytecode, standardJsonInput } = json
  try {
    const deployResult = await ipfsUploadDir(sources, abi, bytecode, standardJsonInput)

    return NextResponse.json(deployResult)
  } catch (error) {
    const err = error as Error
    console.error(`Error in verifyContract: ${err.message}`)
    return NextResponse.json(`Error in verifyContract: ${err.message}`)
  }
}
