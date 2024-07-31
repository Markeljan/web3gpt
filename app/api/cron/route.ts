import { type NextRequest, NextResponse } from "next/server"

import { deleteVerification, getVerifications } from "@/lib/actions/db"
import { checkVerifyStatus, verifyContract } from "@/lib/actions/solidity/verify-contract"
import { CRON_SECRET } from "@/lib/config-server"

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
      // If the verification failed, we  check the verification status
      const guid = verifyResult.result
      const verificationStatus = await checkVerifyStatus(guid, verificationData.viemChain)
      if (verificationStatus.status === "0") {
        continue
      }
      if (verificationStatus.status === "1") {
        console.log(`Verification success: ${verificationData.deployHash}`)
        await deleteVerification(verificationData.deployHash)
        continue
      }
    }
    if (verifyResult.status === "1") {
      const guid = verifyResult.result
      console.log(`Verify success: ${verificationData.deployHash} - ${guid}`)
      await deleteVerification(verificationData.deployHash)
    }
  }

  if (verifications.length > 5) {
    console.error(`Too many verifications in queue: ${verifications.length}`)
  }

  return NextResponse.json({ success: true })
}
