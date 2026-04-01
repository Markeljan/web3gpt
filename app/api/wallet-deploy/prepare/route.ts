import { NextResponse } from "next/server"
import { storeWalletDeployArtifact } from "@/lib/data/kv"
import { compileContractSource } from "@/lib/solidity/compile"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const contractName = typeof body?.contractName === "string" ? body.contractName : ""
    const sourceCode = typeof body?.sourceCode === "string" ? body.sourceCode : ""
    const sources =
      body?.sources && typeof body.sources === "object" && !Array.isArray(body.sources) ? body.sources : undefined

    if (!(contractName && sourceCode)) {
      return NextResponse.json({ error: "contractName and sourceCode are required" }, { status: 400 })
    }

    const compiledContract = await compileContractSource({
      contractName,
      sourceCode,
      sources,
    })

    const artifactId = crypto.randomUUID()
    await storeWalletDeployArtifact(artifactId, {
      abi: compiledContract.abi,
      bytecode: compiledContract.bytecode,
      contractName,
      sources: compiledContract.sources,
      standardJsonInput: compiledContract.standardJsonInput,
    })

    return NextResponse.json({
      artifactId,
      abi: compiledContract.abi,
      bytecode: compiledContract.bytecode,
      standardJsonInput: compiledContract.standardJsonInput,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to compile contract" },
      { status: 500 }
    )
  }
}
