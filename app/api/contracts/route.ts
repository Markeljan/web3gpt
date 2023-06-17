import { getContracts } from "@/lib/contracts";
import createResponse from "@/utils/createResponse";

export async function GET() {
  return createResponse(200, {
    contracts: getContracts(),
  });
}

export async function OPTIONS() {
  return createResponse(200);
}
