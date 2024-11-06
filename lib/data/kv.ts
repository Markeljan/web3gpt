// import "server-only"

import { kv } from "@vercel/kv"
import { unstable_cache as cache } from "next/cache"

import { withUser } from "@/lib/data/auth"
import type { Agent, DbChat, DbChatListItem, VerifyContractParams } from "@/lib/types"

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
    { revalidate: 3600, tags: ["chat-list"] }
  )
)

export const getChat = withUser<string, DbChat | null>(async (id) => {
  return await kv.hgetall<DbChat>(`chat:${id}`)
})

export async function getPublishedChat(id: string) {
  const chat = await kv.hgetall<DbChat>(`chat:${id}`)

  if (!chat?.published) {
    return {
      ...chat,
      messages: []
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

// get all users
export const getUsers = async () => {
  return await kv.smembers("users:list")
}

// import chats from ".data/nov/chats.json"

// const oneMonthAgoInMs = 1728203505

// const maxUsers = new Set(
//   (chats as DbChat[])
//     .map((chat) => (chat.createdAt > oneMonthAgoInMs ? chat.userId : null))
//     .filter((userId) => userId !== null)
// )

// console.log(maxUsers.size)

import agents from ".data/nov/agents.json"

console.log(agents.length)
