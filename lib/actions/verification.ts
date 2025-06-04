"use server"

import { kv } from "@vercel/kv"

import { auth } from "@/auth"
import type { DeploymentRecord, VerifyContractParams } from "@/lib/types"

export const storeVerificationAction = async (data: VerifyContractParams) => {
  await kv.hmset(`verification:${data.deployHash}`, data)
}

export const storeDeploymentAction = async (data: DeploymentRecord) => {
  const session = await auth()
  const userId = session?.user?.id || "anon"

  await Promise.all([
    kv.hmset(`deployment:${data.cid}`, data),
    kv.zadd(`user:deployments:${userId}`, {
      score: Date.now(),
      member: `deployment:${data.cid}`,
    }),
  ])
}
