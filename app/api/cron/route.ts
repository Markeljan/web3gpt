import { type NextRequest, NextResponse } from "next/server"

import { deleteVerification, getVerifications } from "@/lib/actions/db"
import { CRON_SECRET } from "@/lib/config-server"
import { verifyContract } from "@/lib/functions/deploy-contract/verify-contract"

const handleVerificationSuccess = async (deployHash: string, guid: string) => {
  console.log(`Success hash: ${deployHash} - guid: ${guid}`)
  await deleteVerification(deployHash)
}

export const GET = async (req: NextRequest) => {
  const token = req.headers.get("Authorization")
  if (!token) {
    return new Response("Unauthorized", { status: 401 })
  }
  if (token.replace("Bearer ", "") !== CRON_SECRET) {
    return new Response("Unauthorized", { status: 401 })
  }
  const verifications = await getVerifications()
  console.log(
    "Verifications",
    verifications.map((v) => v.deployHash)
  )

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
