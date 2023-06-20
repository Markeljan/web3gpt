import { NextRequest, NextResponse } from "next/server";
import { Chain, createPublicClient, http } from 'viem';
import { getChainMatch, getRpcUrl } from "@/app/lib/helpers/useChains";
import { PostResponseData, PostRequestBody, ContractRequest } from "@/app/types/types";

export async function POST(req: NextRequest) {
    const body: PostRequestBody = await req.json();
    const {
        chain,
        requests,
    } = body;

    // Validate Request Body
    if (!chain || !requests || !Array.isArray(requests) || requests.length === 0) {
        return new NextResponse(`Invalid request body. Missing one or more of required properties: chain, requests.`, { status: 400 });
    }

    // Find the chain object from the chains.json file. Direct match || partial match
    const viemChain: Chain | undefined = getChainMatch(chain);
    if (!viemChain) {
        return new NextResponse(`Chain ${chain} not found`, { status: 404 });
    }

    const rpcUrl: string | undefined = getRpcUrl(viemChain)

    const publicClient = createPublicClient({
        chain: viemChain,
        transport: rpcUrl ? http(rpcUrl) : http()
    });

    const responses = await Promise.allSettled(
        requests.map(async (request: ContractRequest) => {
            try {
                const ABI = await fetchAbi(request.address);
                let data;
                if (request.type === "read") {
                    data = await publicClient.readContract({
                        address: request.address,
                        abi: ABI,
                        functionName: request.functionName,
                        args: request.functionArgs
                    });
                } else if (request.type === "write") {
                    // Placeholder for the write operation.
                    // data = await publicClient.writeContract({...});
                    throw new Error("Write operation not implemented yet.");
                } else {
                    throw new Error(`Invalid operation type: ${request.type}`);
                }
                return { status: 'fulfilled', value: data };
            } catch (error) {
                return { status: 'rejected', reason: error };
            }
        })
    );

    const responseData: PostResponseData = responses.map((response, index) => {
        if (response.status === 'rejected') {
            return { status: 'error', message: `Request ${index + 1} failed with error: ${response.reason}` };
        }
        return { status: 'success', data: response.value };
    });

    return new NextResponse(JSON.stringify(responseData), {
        headers: {
            "content-type": "application/json",
        },
    });
}
