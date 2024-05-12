import deployContract from "@/lib/functions/deploy-contract/deploy-contract"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(req: Request) {
  const json = await req.json()

  if (!json.ownerAddress) {

    return new Response(JSON.stringify({ error: "No ownerAddress provided" }), { status: 400 })
  }

  return NextResponse.json({ message: "success" }, { status: 200 })
}


//   const { chainId, contractName, sourceCode, constructorArgs } = json

//   try {
//     const deployResult = await deployContract({
//       chainId,
//       contractName,
//       sourceCode,
//       constructorArgs
//     })
//     return new Response(JSON.stringify(deployResult))
//   } catch (error) {
//     const err = error as Error
//     console.error(`Error in deployContract: ${err.message}`)
//     return new Response(JSON.stringify({ error: `Error in deployContract: ${err.message}` }), { status: 500 })
//   }
// }
