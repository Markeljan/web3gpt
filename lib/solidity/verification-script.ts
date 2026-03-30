import { deleteVerification, getVerifications, updateVerification } from "@/lib/data/kv"
import { checkVerifyStatus, verifyContract } from "@/lib/solidity/verification"

const PASS_MESSAGE = "Pass - Verified"
const ALREADY_VERIFIED_MESSAGES = ["Smart-contract already verified.", "Contract source code already verified"]
const VERIFICATION_LIMIT = 25
const PENDING_MESSAGES = ["Pending in queue", "Already Queued", "In progress", "In queue"]
const RETRYABLE_SUBMISSION_ERRORS = [
  "Unable to locate ContractCode",
  "The address is not a smart contract",
  "Pending in queue",
]

const isAlreadyVerified = (value?: string) =>
  Boolean(value && ALREADY_VERIFIED_MESSAGES.some((message) => value.includes(message)))

const isPending = (value?: string) => Boolean(value && PENDING_MESSAGES.some((message) => value.includes(message)))

const isRetryableSubmissionError = (value?: string) =>
  Boolean(value && RETRYABLE_SUBMISSION_ERRORS.some((message) => value.includes(message)))

type VerificationQueueItem = Awaited<ReturnType<typeof getVerifications>>[number]

const setVerificationFailure = async (
  deployHash: string,
  verificationAttempts: number,
  verificationStatus: "queued" | "submitted" | "error",
  errorMessage: string
) => {
  await updateVerification(deployHash, {
    verificationAttempts,
    verificationStatus,
    lastCheckedAt: Date.now(),
    lastVerificationError: errorMessage,
  })
}

const submitVerification = async (verificationData: VerificationQueueItem) => {
  const verificationAttempts = (verificationData.verificationAttempts || 0) + 1
  const submission = await verifyContract(verificationData)

  if (isAlreadyVerified(submission.result)) {
    await deleteVerification(verificationData.deployHash)
    return "verified" as const
  }

  if (submission.status === "1" && submission.message === "OK" && submission.result) {
    await updateVerification(verificationData.deployHash, {
      verificationAttempts,
      verificationGuid: submission.result,
      verificationStatus: "submitted",
      submittedAt: verificationData.submittedAt || Date.now(),
      lastCheckedAt: Date.now(),
      lastVerificationError: "",
    })
    return "submitted" as const
  }

  await setVerificationFailure(
    verificationData.deployHash,
    verificationAttempts,
    isRetryableSubmissionError(submission.result) ? "queued" : "error",
    submission.result || submission.message || "Unknown verification submission error"
  )

  return "failed" as const
}

const checkSubmittedVerification = async (verificationData: VerificationQueueItem) => {
  const verificationAttempts = (verificationData.verificationAttempts || 0) + 1
  const verificationStatus = await checkVerifyStatus(
    verificationData.verificationGuid || "",
    verificationData.viemChain
  )

  if (verificationStatus.result === PASS_MESSAGE || isAlreadyVerified(verificationStatus.result)) {
    await deleteVerification(verificationData.deployHash)
    return "verified" as const
  }

  if (isPending(verificationStatus.result)) {
    await updateVerification(verificationData.deployHash, {
      verificationAttempts,
      verificationStatus: "submitted",
      lastCheckedAt: Date.now(),
      lastVerificationError: "",
    })
    return "pending" as const
  }

  await setVerificationFailure(
    verificationData.deployHash,
    verificationAttempts,
    "error",
    verificationStatus.result || verificationStatus.message || "Unknown verification status"
  )

  return "failed" as const
}

export async function processVerifications() {
  const verifications = await getVerifications()
  const queuedVerifications = verifications.slice(0, VERIFICATION_LIMIT)
  const result = {
    success: true,
    verificationCount: verifications.length,
    processed: queuedVerifications.length,
    submitted: 0,
    pending: 0,
    verified: 0,
    failed: 0,
  }

  for (const verificationData of queuedVerifications) {
    try {
      const status = verificationData.verificationGuid
        ? await checkSubmittedVerification(verificationData)
        : await submitVerification(verificationData)

      if (status === "verified") {
        result.verified += 1
      } else if (status === "submitted") {
        result.submitted += 1
      } else if (status === "pending") {
        result.pending += 1
      } else {
        result.failed += 1
      }
    } catch (error) {
      await setVerificationFailure(
        verificationData.deployHash,
        (verificationData.verificationAttempts || 0) + 1,
        verificationData.verificationGuid ? "submitted" : "queued",
        error instanceof Error ? error.message : "Verification request failed"
      )
      result.failed += 1
    }
  }

  if (verifications.length > VERIFICATION_LIMIT) {
    console.error(`Verification queue over limit: ${verifications.length}`)
  }

  return result
}
