import { auth } from '@/auth'
import verifyContract from '@/lib/functions/verify-contract';

export async function POST(req: Request) {
    const json = await req.json();
    const { deployHash, standardJsonInput, encodedConstructorArgs, fileName, contractName, viemChain } = json;
    console.log("Verification request received:", json);

    const session = await auth();

    if (session == null) {
        return new Response('Unauthorized', { status: 401 });
    }

    const verifyResult = await verifyContract({
        deployHash,
        standardJsonInput,
        encodedConstructorArgs,
        fileName,
        contractName,
        viemChain
    });

    return new Response(JSON.stringify(verifyResult));
}
