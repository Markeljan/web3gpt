import { deployContract } from "@/lib/functions/deploy-contract/deploy-contract"

export const runtime = "nodejs"

export async function POST(req: Request) {
  const json = await req.json()
  const { chainId, contractName, sourceCode, constructorArgs } = json

  try {
    const deployResult = await deployContract({
      chainId,
      contractName,
      sourceCode,
      constructorArgs
    })
    return new Response(JSON.stringify(deployResult))
  } catch (error) {
    const err = error as Error
    console.error(`Error in deployContract API ROUTE: ${err.message}`)
    return new Response(JSON.stringify({ error: `Error in deployContract: ${err.message}` }), { status: 500 })
  }
}
