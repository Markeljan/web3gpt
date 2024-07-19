import { type NextRequest, NextResponse } from "next/server"

import { deleteVerification, getVerifications } from "@/lib/actions/db"
import { CRON_SECRET } from "@/lib/config-server"
import { verifyContract } from "@/lib/functions/deploy-contract/verify-contract"

export const GET = async (req: NextRequest) => {
  const token = req.headers.get("Authorization")
  if (!token) {
    return new Response("Unauthorized", { status: 401 })
  }
  if (token.replace("Bearer ", "") !== CRON_SECRET) {
    return new Response("Unauthorized", { status: 401 })
  }
  const verifications = await getVerifications()

  for (const verificationData of verifications) {
    const guid = await verifyContract(verificationData)
    if (guid) {
      await deleteVerification(verificationData.deployHash)
    }
  }

  return NextResponse.json({ success: true })
}
