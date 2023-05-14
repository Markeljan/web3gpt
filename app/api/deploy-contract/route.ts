import createResponse from "@/app/utils/createResponse";
import { deployContract } from "@/lib/contracts";
import { DeployResults } from "@/lib/types";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    name,
    chains,
    sourceCode,
  }: {
    name: string;
    chains: string[];
    sourceCode: string;
  } = body;

  const contractData = await Promise.all(
    chains.map(async (chain: string) => {
      const deploymentResponse: DeployResults = await deployContract(name, chain, sourceCode);
      return deploymentResponse;
    })
  );

  return createResponse(200, {
    contracts: contractData,
  });
}

export async function OPTIONS() {
  return createResponse(200);
}
