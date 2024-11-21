"use server"

import { revalidateTag } from "next/cache"

import { auth } from "@/auth"
import { withUser } from "@/lib/data/kv"
import type { DbChatListItem } from "@/lib/types"
import { kv } from "@vercel/kv"

export const shareChatAction = withUser<DbChatListItem, void>(async (chat, userId) => {
  if (userId !== String(chat.userId)) {
    return
  }

  const payload = {
    ...chat,
    published: true,
  }

  await kv.hmset(`chat:${chat.id}`, payload)

  return revalidateTag("chat-list")
})
export const deleteChatAction = withUser<string, void>(async (id, userId) => {
  await Promise.all([kv.del(`chat:${id}`), kv.zrem(`user:chat:${userId}`, `chat:${id}`)])

  return revalidateTag("chat-list")
})

export async function storeEmailAction(email: string) {
  await kv.sadd("emails:list", email)

  const session = await auth()
  const userId = session?.user.id

  if (userId) {
    await kv.hmset(`user:details:${userId}`, {
      email_subscribed: true,
    })
  }
}

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
