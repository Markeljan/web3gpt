import { type NextRequest, NextResponse } from "next/server"

import { verifyContract } from "@/lib/actions/solidity/verify-contract"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  const data = await req.json()
  const { deployHash, standardJsonInput, encodedConstructorArgs, fileName, contractName, viemChain } = data

  try {
    const deployResult = await verifyContract({
      deployHash,
      standardJsonInput,
      encodedConstructorArgs,
      fileName,
      contractName,
      viemChain
    })
    return NextResponse.json(deployResult)
  } catch (error) {
    return NextResponse.json(`Error in verifyContract: ${error}`)
  }
}
