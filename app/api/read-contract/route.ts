import { NextRequest, NextResponse } from "next/server";
import { Chain, createPublicClient, http } from 'viem';
import { getChainMatch, getRpcUrl } from "@/app/lib/helpers/useChains";
import { ReadContractRequest, ReadContractResponse } from "@/app/types/types";
import fetchAbi from "@/app/lib/helpers/fetchAbi";

export async function POST(req: NextRequest) {
    console.log("POST /api/read-contract");
    const body: ReadContractRequest = await req.json();
    console.log(body);
    const {
        chain,
        requests,
    } = body;
    console.log("functionArgs:", requests[0].functionArgs)
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
    console.log("rpcUrl:", rpcUrl)

    const publicClient = createPublicClient({
        chain: viemChain,
        transport: rpcUrl ? http(rpcUrl) : http()
    });


    // Assume that all requests are for the same contract and fetch ABI once
    const ABI = await fetchAbi(requests[0].address);

    const responses = await Promise.allSettled(
        requests.map(async (request) => {
            try {
                const data = await publicClient.readContract({
                    address: request.address,
                    abi: ABI,
                    functionName: request.functionName,
                    args: request.functionArgs
                });
                return { status: 'fulfilled', value: data };
            } catch (error) {
                return { status: 'rejected', reason: (error as Error).message };
            }
        })
    );

    const responsesArray = responses.map((response, index) => {
        if (response.status === 'rejected') {
            console.error(`Request ${index + 1} failed with error: ${response.reason}`);
            return null;  // or handle this case differently based on your requirements
        }
        return { status: 'success', data: response.value };
    });

    const responseData: ReadContractResponse = responsesArray.filter(response => response !== null) as ReadContractResponse;


    return new NextResponse(jsonStringifyBigInt(responseData), {
        headers: {
            "content-type": "application/json",
        },
    });
}

function jsonStringifyBigInt(data: any) {
    return JSON.stringify(data, (key, value) =>
        typeof value === 'bigint'
            ? value.toString()
            : value
    );
}
