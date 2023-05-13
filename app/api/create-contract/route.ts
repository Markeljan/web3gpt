// app/api/create-contract/route.ts
import { createContract } from "@/lib/contracts";
import createResponse from "@/app/utils/createResponse";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log("body: ", body);
  createContract(body.contract);
  return createResponse(200, { success: true });
}

export async function OPTIONS() {
  return createResponse(200);
}
