import { deleteVerification, getVerifications } from "@/lib/data/kv"
import { checkVerifyStatus, verifyContract } from "@/lib/solidity/verification"

const PASS_MESSAGE = "Pass - Verified"
const ALREADY_VERIFIED_MESSAGES = ["Smart-contract already verified.", "Contract source code already verified"]

export async function processVerifications() {
  const verifications = await getVerifications()

  for (const verificationData of verifications) {
    try {
      const { result: guid } = await verifyContract(verificationData)
      if (ALREADY_VERIFIED_MESSAGES.includes(guid)) {
        await deleteVerification(verificationData.deployHash)
        continue
      }
      const verificationStatus = await checkVerifyStatus(guid, verificationData.viemChain)
      if (verificationStatus.result === PASS_MESSAGE) {
        await deleteVerification(verificationData.deployHash)
      }
    } catch (error) {
      console.error(error instanceof Error ? error.message : "Unknown error")
    }
  }

  if (verifications.length > 5) console.error(`Too many verifications in queue: ${verifications.length}`)

  return { success: true, verificationCount: verifications.length }
}
