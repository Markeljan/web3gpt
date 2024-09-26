"use server"

import { revalidateTag } from "next/cache"

import { kv } from "@vercel/kv"

import { auth } from "@/auth"
import { withUser } from "@/lib/data/auth"
import type { Agent, DbChat, DbChatListItem, VerifyContractParams } from "@/lib/types"

export const storeChatAction = withUser<
  {
    data: DbChat
    userId: string
  },
  void
>(async ({ data, userId }) => {
  if (userId !== data.userId) {
    return
  }

  const payload: DbChat = {
    ...data,
    userId
  }

  await Promise.all([
    kv.hmset(`chat:${data.id}`, payload),
    kv.zadd(`user:chat:${userId}`, {
      score: data.createdAt,
      member: `chat:${data.id}`
    })
  ])

  return revalidateTag("chat-list")
})

export const storeAgentAction = withUser<Agent, void>(async (agent, userId) => {
  if (userId !== agent.userId) {
    return
  }
  await Promise.all([kv.hmset(`agent:${agent.id}`, agent), kv.sadd("agents:list", agent.id)])
})

export async function storeEmailAction(email: string) {
  await kv.sadd("emails:list", email)

  const session = await auth()
  const userId = session?.user.id

  if (userId) {
    await kv.hmset(`user:details:${userId}`, {
      email_subscribed: true
    })
  }
}

export const shareChatAction = withUser<DbChatListItem, void>(async (chat, userId) => {
  if (userId !== String(chat.userId)) {
    return
  }

  const payload = {
    ...chat,
    published: true
  }

  await kv.hmset(`chat:${chat.id}`, payload)

  return revalidateTag("chat-list")
})

export const storeVerificationAction = async (data: VerifyContractParams) => {
  await kv.hmset(`verification:${data.deployHash}`, data)
}

export const storeDeploymentAction = withUser<
  {
    chainId: string
    deployHash: string
    contractAddress: string
    cid: string
  },
  void
>(async (data, userId) => {
  await Promise.all([
    kv.hmset(`deployment:${data.cid}`, data),
    kv.zadd(`user:deployments:${userId}`, {
      score: Date.now(),
      member: `deployment:${data.cid}`
    })
  ])
})

export const storeTokenScriptDeploymentAction = withUser<
  {
    chainId: string
    deployHash: string
    cid: string
    tokenAddress: string
  },
  void
>(async (data, userId) => {
  await kv.hmset(`tokenscript:${data.cid}`, data)

  await kv.zadd(`user:tokenscripts:${userId}`, {
    score: Date.now(),
    member: `tokenscript:${data.cid}`
  })
})

export const getUserFieldAction = withUser<string, string | null>(async (fieldName, userId) => {
  const userKey = `user:details:${userId}`
  const userDetails = await kv.hgetall<{ [key: string]: string }>(userKey)
  return userDetails?.[fieldName] || null
})

export const clearChatsAction = withUser<void, void>(async (_, userId) => {
  const chats: string[] = await kv.zrange(`user:chat:${userId}`, 0, -1)
  if (!chats.length) {
    return
  }
  const pipeline = kv.pipeline()

  for (const chat of chats) {
    pipeline.del(chat)
    pipeline.zrem(`user:chat:${userId}`, chat)
  }

  await pipeline.exec()

  return revalidateTag("chat-list")
})

export const deleteChatAction = withUser<string, void>(async (id, userId) => {
  await Promise.all([kv.del(`chat:${id}`), kv.zrem(`user:chat:${userId}`, `chat:${id}`)])

  return revalidateTag("chat-list")
})
