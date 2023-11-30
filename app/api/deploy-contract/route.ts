import deployContract from '@/lib/functions/deploy-contract/deploy-contract'

export async function POST(req: Request) {
  const json = await req.json()
  const { chainId, contractName, sourceCode, constructorArgs, evmVersion } =
    json

  console.log(
    `Received request to deploy contract ${contractName} on chain ${chainId}`
  )

  try {
    const deployResult = await deployContract({
      chainId,
      contractName,
      sourceCode,
      evmVersion,
      constructorArgs
    })
    return new Response(JSON.stringify(deployResult))
  } catch (error) {
    const err = error as Error
    console.error(`Error in deployContract: ${err.message}`)
    return new Response(
      JSON.stringify({ error: `Error in deployContract: ${err.message}` }),
      { status: 500 }
    )
  }
}
