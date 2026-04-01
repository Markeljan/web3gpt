"use server"
import { auth } from "@/auth"
import { storeDeployment, storeVerification } from "@/lib/data/kv"
import type { DeploymentRecord, VerifyContractParams } from "@/lib/types"

export const storeVerificationAction = async (data: VerifyContractParams) => {
  await storeVerification(data)
}

export const storeDeploymentAction = async (data: DeploymentRecord) => {
  const session = await auth()
  const userId = session?.user?.id || "anon"

  await storeDeployment(data, userId)
}
