import { deleteVerification, getVerifications } from "@/lib/data/kv"
import { checkVerifyStatus, verifyContract } from "@/lib/solidity/verification"

const PASS_MESSAGE = "Pass - Verified"
const ALREADY_VERIFIED_MESSAGES = ["Smart-contract already verified.", "Contract source code already verified"]
const VERIFICATION_LIMIT = 5

export async function processVerifications() {
  const verifications = await getVerifications()

  for (const verificationData of verifications) {
    try {
      const { result: guid, message, status } = await verifyContract(verificationData)
      if (ALREADY_VERIFIED_MESSAGES.includes(guid) || (status === "1" && message === "OK")) {
        await deleteVerification(verificationData.deployHash)
        continue
      }
      const verificationStatus = await checkVerifyStatus(guid, verificationData.viemChain)
      if (verificationStatus.result === PASS_MESSAGE) {
        await deleteVerification(verificationData.deployHash)
      }
    } catch (_error) {
      // ignore
    }
  }

  if (verifications.length > VERIFICATION_LIMIT) {
    console.error(`Verification queue over limit: ${verifications.length}`)
  }

  return { success: true, verificationCount: verifications.length }
}
