import { NextRequest, NextResponse } from "next/server";
import { Chain } from 'viem';
import { getChainMatch, getRpcUrl } from "@/app/lib/helpers/useChains";
import { FetchAbiRequest } from "@/app/types/types";
import fetchAbi from "@/app/lib/helpers/fetchAbi";

export async function POST(req: NextRequest) {
    console.log("POST /api/fetch-abi");
    const body: FetchAbiRequest = await req.json();
    console.log(body);
    const {
        chain,
        address,
    } = body;

    // Validate Request Body
    if (!chain || !address) {
        return new NextResponse(`Invalid request body. Missing one or more of required properties: chain, address.`, { status: 400 });
    }

    // Find the chain object from the chains.json file. Direct match || partial match
    const viemChain: Chain | undefined = getChainMatch(chain);
    if (!viemChain) {
        return new NextResponse(`Chain ${chain} not found`, { status: 404 });
    }

    const rpcUrl: string | undefined = getRpcUrl(viemChain)
    console.log("rpcUrl:", rpcUrl)

    // Fetch ABI
    const ABI = await fetchAbi(viemChain, address as `0x${string}`);

    return new NextResponse(JSON.stringify({ abi: ABI }), {
        headers: {
            "content-type": "application/json",
        },
    });
}
