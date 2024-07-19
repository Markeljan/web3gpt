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
    const verifyResult = await verifyContract(verificationData)

    if (verifyResult.status === "0") {
      if (verifyResult.result === "Contract source code already verified") {
        console.log(`Verify success: ${verificationData.deployHash} - Already verified`)
        await deleteVerification(verificationData.deployHash)
        continue
      }
      console.error(`Verify error: ${verificationData.deployHash} - ${verifyResult.result}`)
      continue
    }
    if (verifyResult.status === "1") {
      const guid = verifyResult.result
      console.log(`Verify success: ${verificationData.deployHash} - ${guid}`)
      await deleteVerification(verificationData.deployHash)
    }
  }

  return NextResponse.json({ success: true })
}
