import { type NextRequest, NextResponse } from "next/server"

import { deleteVerification, getVerifications } from "@/lib/actions/db"
import { checkVerifyStatus, verifyContract } from "@/lib/actions/solidity/verify-contract"
import { CRON_SECRET } from "@/lib/config-server"

const PASS_MESSAGE = "Pass - Verified"
const ALLREADY_VERIFIED_MESSAGE = "Smart-contract already verified."

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
    const { result: guid } = await verifyContract(verificationData)
    if (guid === ALLREADY_VERIFIED_MESSAGE) {
      console.log(`${verificationData.viemChain.name} ${verificationData.deployHash}`)
      await deleteVerification(verificationData.deployHash)
      continue
    }
    const verificationStatus = await checkVerifyStatus(guid, verificationData.viemChain)
    if (verificationStatus.result === PASS_MESSAGE) {
      console.log(`${verificationData.viemChain.name} ${verificationData.deployHash}`)
      await deleteVerification(verificationData.deployHash)
    }
  }

  if (verifications.length > 5) {
    console.error(`Too many verifications in queue: ${verifications.length}`)
  }

  return NextResponse.json({ success: true })
}
