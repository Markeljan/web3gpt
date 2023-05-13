import createResponse from "@/app/utils/createResponse";
import { deployContract } from "@/lib/contracts";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log("body: ", body);
  const { name, chain, sourceCode } = body;
  return createResponse(200, {
    contract: await deployContract(name, chain, sourceCode),
  });
}

export async function OPTIONS() {
  return createResponse(200);
}
