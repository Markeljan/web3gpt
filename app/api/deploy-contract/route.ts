import { type NextRequest, NextResponse } from "next/server"

import { deployContract } from "@/lib/actions/solidity/deploy-contract"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  const data = await req.json()
  const { chainId, contractName, sourceCode, constructorArgs } = data

  try {
    const deployResult = await deployContract({
      chainId,
      contractName,
      sourceCode,
      constructorArgs
    })
    return NextResponse.json(deployResult)
  } catch (error) {
    return NextResponse.json(`Error in deployContract API ROUTE: ${error}`)
  }
}
