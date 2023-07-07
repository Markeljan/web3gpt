import { auth } from '@/auth'
import deployContract from '@/lib/functions/deploy-contract';

const runtime = 'edge'

export async function POST(req: Request) {
    const json = await req.json()
    const { chainName, contractName, sourceCode, constructorArgs } = json
    console.log("request recieved:", json)
    const session = await auth()

    if (session == null) {
        return new Response('Unauthorized', { status: 401 })
    }

    const deployResult = await deployContract({
        chainName,
        contractName,
        sourceCode,
        constructorArgs,
    });

    return new Response(JSON.stringify(deployResult));
}