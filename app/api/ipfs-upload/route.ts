import { ipfsUpload } from "@/lib/functions/deploy-contract/ipfs-upload"

export const runtime = "edge"

export async function POST(req: Request) {
  const json = await req.json()
  const { sources, abi, bytecode, standardJsonInput } = json
  try {
    const deployResult = await ipfsUpload(sources, JSON.stringify(abi), bytecode, standardJsonInput)

    return new Response(JSON.stringify(deployResult))
  } catch (error) {
    const err = error as Error
    console.error(`Error in verifyContract: ${err.message}`)
    return new Response(JSON.stringify({ error: `Error in verifyContract: ${err.message}` }), { status: 500 })
  }
}
