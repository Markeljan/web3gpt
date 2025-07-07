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
  const verifications: VerifyContractParams[] = []
  const BATCH_SIZE = 100 // Process 100 keys at a time
  let cursor = 0
  
  do {
    // Use SCAN instead of KEYS to avoid blocking
    const [nextCursor, keys] = await kv.scan(cursor, {
      match: "verification:*",
      count: BATCH_SIZE
    })
    
    cursor = Number.parseInt(nextCursor)
    
    if (keys && keys.length > 0) {
      // Process in batches to avoid "too many keys" error
      const pipeline = kv.pipeline()
      for (const key of keys) {
        pipeline.hgetall<VerifyContractParams>(key)
      }
      const batchResults = await pipeline.exec<VerifyContractParams[]>()
      verifications.push(...batchResults.filter(Boolean))
    }
  } while (cursor !== 0)
  
  return verifications
}

export const deleteVerification = async (deployHash: string) => {
  await kv.del(`verification:${deployHash}`)
}

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

export const getUserDeployments = withUser<void, DeploymentRecord[]>(async (_, userId) => {
  const deploymentKeys = await kv.zrange<string[]>(`user:deployments:${userId}`, 0, -1, { rev: true })

  if (!deploymentKeys.length) {
    return []
  }

  const pipeline = kv.pipeline()
  for (const deploymentKey of deploymentKeys) {
    const fullKey = deploymentKey.startsWith("deployment:") ? deploymentKey : `deployment:${deploymentKey}`
    pipeline.hgetall<DeploymentRecord>(fullKey)
  }

  const results = await pipeline.exec<DeploymentRecord[]>()

  return results.filter(Boolean)
})

export const getAllDeployments = async () => {
  const deployments: DeploymentRecord[] = []
  const BATCH_SIZE = 100 // Process 100 keys at a time
  let cursor = 0
  
  do {
    // Use SCAN instead of KEYS to avoid blocking
    const [nextCursor, keys] = await kv.scan(cursor, {
      match: "deployment:*",
      count: BATCH_SIZE
    })
    
    cursor = Number.parseInt(nextCursor)
    
    if (keys && keys.length > 0) {
      // Process in batches to avoid "too many keys" error
      const pipeline = kv.pipeline()
      for (const key of keys) {
        pipeline.hgetall<DeploymentRecord>(key)
      }
      const batchResults = await pipeline.exec<DeploymentRecord[]>()
      deployments.push(...batchResults.filter(Boolean))
    }
  } while (cursor !== 0)
  
  return deployments
}
