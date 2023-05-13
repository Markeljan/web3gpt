// app/api/contracts/route.ts
import { getContracts } from "@/lib/contracts";
import createResponse from "@/app/utils/createResponse";

export async function GET() {
  return createResponse(200, {
    contracts: getContracts(),
  });
}

export async function OPTIONS() {
  return createResponse(200);
}
