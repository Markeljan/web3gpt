// app/api/delete-contract/route.ts
import { deleteContract } from "@/lib/contracts";
import createResponse from "@/app/utils/createResponse";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  deleteContract(body.contract);
  return createResponse(200, { success: true });
}

export async function OPTIONS() {
  return createResponse(200);
}
