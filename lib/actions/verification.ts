"use server"

import { kv } from "@vercel/kv"

import type { VerifyContractParams } from "@/lib/types"
import { auth } from "@/auth"

export const storeVerificationAction = async (data: VerifyContractParams) => {
  await kv.hmset(`verification:${data.deployHash}`, data)
}

export const storeDeploymentAction = async (data: {
  chainId: string
  deployHash: string
  contractAddress: string
  cid: string
}) => {
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
