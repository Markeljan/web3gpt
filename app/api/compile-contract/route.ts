import compileContract from "@/lib/functions/deploy-contract/compile-contract"

export const runtime = "nodejs"

export async function POST(req: Request) {
  const json = await req.json()
  const { standardJsonInput, contractName } = json
  try {
    const compileResult = await compileContract({
      standardJsonInput,
      contractName
    })
    return new Response(JSON.stringify(compileResult))
  } catch (error) {
    const err = error as Error
    console.error(`Error in compileContract: ${err.message}`)
    return new Response(JSON.stringify({ error: `Error in compileContract: ${err.message}` }), { status: 500 })
  }
}
