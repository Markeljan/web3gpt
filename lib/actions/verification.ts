"use server"
import { getSession } from "@/lib/auth"
import { storeDeployment, storeVerification } from "@/lib/data/kv"
import type { DeploymentRecord, VerifyContractParams } from "@/lib/types"

export const storeVerificationAction = async (data: VerifyContractParams) => {
  await storeVerification(data)
}

export const storeDeploymentAction = async (data: DeploymentRecord) => {
  const session = await getSession()
  const userId = session?.user?.id || "anon"

  await storeDeployment(data, userId)
}
