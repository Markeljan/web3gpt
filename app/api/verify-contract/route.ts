import { verifyContract } from '@/lib/functions/deploy-contract/verify-contract'

// TODO: try to enable edge runtime
export const runtime = 'edge'

export async function POST(req: Request) {
  const json = await req.json()
  const {
    deployHash,
    standardJsonInput,
    encodedConstructorArgs,
    fileName,
    contractName,
    viemChain
  } = json

  try {
    const deployResult = await verifyContract({
      deployHash,
      standardJsonInput,
      encodedConstructorArgs,
      fileName,
      contractName,
      viemChain
    })
    return new Response(JSON.stringify(deployResult))
  } catch (error) {
    const err = error as Error
    console.error(`Error in verifyContract: ${err.message}`)
    return new Response(
      JSON.stringify({ error: `Error in verifyContract: ${err.message}` }),
      { status: 500 }
    )
  }
}
