import { auth } from '@/auth'
import verifyContract from '@/lib/deploy-contract/verify-contract';

const runtime = 'edge'

export async function POST(req: Request) {
    const json = await req.json()
    console.log('verify-contract json:', json);
    const {
        deployHash,
        standardJsonInput,
        encodedConstructorArgs,
        fileName,
        contractName,
        viemChain,
    } = json
    const session = await auth()

    if (session == null) {
        return new Response('Unauthorized', { status: 401 })
    }
    try {
        const verifyResponse = await verifyContract({
            deployHash,
            standardJsonInput,
            encodedConstructorArgs,
            fileName,
            contractName,
            viemChain,
        });
        return new Response(JSON.stringify(verifyResponse));
    } catch (error) {
        const err = error as Error
        console.error(`Error in verifyContract: ${err.message}\nStacktrace: ${err.stack}`);
        return new Response(JSON.stringify({ error: `Error in verifyContract: ${err.message}` }), { status: 500 });
    }
}
