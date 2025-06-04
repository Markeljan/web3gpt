import "server-only"

import { kv } from "@vercel/kv"
import { unstable_cache as cache, revalidateTag } from "next/cache"

import { auth } from "@/auth"
import type { Agent, DbChat, DbChatListItem, DeploymentRecord, VerifyContractParams } from "@/lib/types"

type ActionWithUser<T, R> = (data: T, userId: string) => Promise<R>

export const withUser = <T, R>(action: ActionWithUser<T, R>) => {
  return async (data: T): Promise<R | undefined> => {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) return

    return action(data, userId)
  }
}

export async function storeUser(user: { id: string }) {
  const userKey = `user:details:${user.id}`

  await kv.hmset(userKey, user)

  await kv.sadd("users:list", user.id)
}

export const getChatList = withUser<void, DbChatListItem[]>(
  cache(
    async (_, userId) => {
      const chats: string[] = await kv.zrange(`user:chat:${userId}`, 0, -1, { rev: true })
      if (!chats.length) {
        return []
      }
      const pipeline = kv.pipeline()

      for (const chat of chats) {
        pipeline.hmget<DbChatListItem>(chat, "id", "title", "published", "createdAt", "avatarUrl", "userId")
      }
      return await pipeline.exec<DbChatListItem[]>()
    },
    ["chat-list"],
    { revalidate: 3600, tags: ["chat-list"] },
  ),
)

export const getChat = withUser<string, DbChat | null>(async (id) => {
  return await kv.hgetall<DbChat>(`chat:${id}`)
})

export async function getPublishedChat(id: string) {
  const chat = await kv.hgetall<DbChat>(`chat:${id}`)

  if (!chat?.published) {
    return {
      ...chat,
      messages: [],
    }
  }

  return chat
}

export const getAgent = async (id: string) => {
  return await kv.hgetall<Agent>(`agent:${id}`)
}

// verifications

export const getVerifications = async () => {
  const verifications = await kv.keys("verification:*")
  if (!verifications || verifications.length === 0) {
    return []
  }
  const pipeline = kv.pipeline()

  for (const verification of verifications) {
    pipeline.hgetall<VerifyContractParams>(verification)
  }

  if (!pipeline) {
    return []
  }
  return await pipeline.exec<VerifyContractParams[]>()
}

export const deleteVerification = async (deployHash: string) => {
  await kv.del(`verification:${deployHash}`)
}

export const getUserDeployments = withUser<void, DeploymentRecord[]>(async (_, userId) => {
  const deployments = await kv.zrange<string[]>(`user:deployments:${userId}`, 0, -1, { rev: true })
  if (!deployments.length) {
    return []
  }
  const pipeline = kv.pipeline()
  for (const deployment of deployments) {
    pipeline.hgetall<DeploymentRecord>(deployment)
  }
  return await pipeline.exec<DeploymentRecord[]>()
})

export const storeAgent = withUser<Agent, void>(async (agent, userId) => {
  if (userId !== agent.userId) {
    return
  }
  await Promise.all([kv.hmset(`agent:${agent.id}`, agent), kv.sadd("agents:list", agent.id)])
})

export const storeChat = withUser<
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
    userId,
  }

  await Promise.all([
    kv.hmset(`chat:${data.id}`, payload),
    kv.zadd(`user:chat:${userId}`, {
      score: data.createdAt,
      member: `chat:${data.id}`,
    }),
  ])

  return revalidateTag("chat-list")
})
