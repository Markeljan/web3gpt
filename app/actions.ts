"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { kv } from "@vercel/kv"

import { auth } from "@/auth"
import type { Agent, DbChat, DbChatListItem } from "@/lib/types"

// Store a new user's details
export async function storeUser(user: { id: string | number }) {
  const userKey = `user:details:${user.id}`

  // Save user details
  await kv.hmset(userKey, user)

  // Add user's ID to the list of all users
  await kv.sadd("users:list", user.id)
}

export async function storeEmail(email: string) {
  // Add email to the list of all emails
  await kv.sadd("emails:list", email)
  // if user is logged in, set email_subscribed to true
  const session = await auth()
  if (session?.user?.id) {
    await kv.hmset(`user:details:${session.user.id}`, {
      email_subscribed: true
    })
  }
}

// Get all chatIds and titles for a user
export async function getChatList() {
  const session = await auth()

  if (!session?.user?.id) {
    return []
  }

  try {
    const pipeline = kv.pipeline()
    const chats: string[] = await kv.zrange(`user:chat:${session.user.id}`, 0, -1, {
      rev: true
    })

    for (const chat of chats) {
      // get chat id and title
      pipeline?.hmget(chat, "id", "title", "published", "createdAt", "avatarUrl", "userId")
    }

    const results = await pipeline?.exec()

    return results as DbChatListItem[]
  } catch {
    return []
  }
}

export async function getChats() {
  const session = await auth()

  if (!session?.user?.id) {
    return null
  }
  const userId = session.user.id

  if (!userId) {
    return []
  }

  try {
    const pipeline = kv.pipeline()
    const chats: string[] = await kv.zrange(`user:chat:${userId}`, 0, -1, {
      rev: true
    })

    for (const chat of chats) {
      pipeline.hgetall(chat)
    }

    const results = await pipeline?.exec()
    return results as DbChat[]
  } catch {
    return []
  }
}

export async function getChat(id: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return null
  }
  const userId = session.user.id

  if (!userId) {
    return null
  }

  const chat = await kv.hgetall<DbChat>(`chat:${id}`)
  return chat
}

export async function removeChat({ id, path }: { id: string; path: string }) {
  const session = await auth()

  if (!session) {
    return {
      error: "Unauthorized"
    }
  }

  const uid = await kv.hget<string>(`chat:${id}`, "userId")

  if (String(uid) !== session?.user?.id) {
    return {
      error: "Unauthorized"
    }
  }

  await kv.del(`chat:${id}`)
  await kv.zrem(`user:chat:${session.user.id}`, `chat:${id}`)

  revalidatePath("/")
  return revalidatePath(path)
}

export async function clearChats() {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: "Unauthorized"
    }
  }

  const chats: string[] = await kv.zrange(`user:chat:${session.user.id}`, 0, -1)
  if (!chats.length) {
    return redirect("/")
  }
  const pipeline = kv.pipeline()

  for (const chat of chats) {
    pipeline.del(chat)
    pipeline.zrem(`user:chat:${session.user.id}`, chat)
  }

  await pipeline.exec()

  revalidatePath("/")
  return redirect("/")
}

export async function getPublishedChat(id: string) {
  const chat = await kv.hgetall<DbChat>(`chat:${id}`)

  if (!chat) {
    return null
  }

  if (!chat.published) {
    return {
      ...chat,
      messages: []
    }
  }

  return chat
}

export async function shareChat(chat: DbChatListItem) {
  const session = await auth()
  const userId = session?.user?.id

  if (userId !== chat.userId) {
    return {
      error: "Unauthorized"
    }
  }

  const payload = {
    ...chat,
    published: true
  }

  await kv.hmset(`chat:${chat.id}`, payload)

  return payload
}

export async function getUserField(fieldName: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return null
    }

    const userKey = `user:details:${session.user.id}`
    const userDetails = await kv.hgetall(userKey)

    return userDetails?.[fieldName]
  } catch (error) {
    console.error(error)
    return null
  }
}

export const storeAgent = async (agent: Agent) => {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: "Unauthorized"
    }
  }
  await kv.hmset(`agent:${agent.id}`, agent)
  await kv.sadd("agents:list", agent.id)
}

export const deleteAgent = async (id: string) => {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: "Unauthorized"
    }
  }

  // get the id make sure the creator is the user
  const agent = await kv.hgetall<Agent>(`agent:${id}`)
  if (!agent) {
    return {
      error: "Agent not found"
    }
  }

  if (agent.creator !== session.user.id) {
    return {
      error: "Not authorized"
    }
  }

  await kv.del(`agent:${id}`)
  await kv.srem("agents:list", id)
}

export const getAgent = async (id: string) => {
  const agent = await kv.hgetall<Agent>(`agent:${id}`)
  return agent
}

export const getAgents = async () => {
  const agents = await kv.smembers("agents:list")
  const pipeline = kv.pipeline()

  for (const agentId of agents) {
    pipeline.hgetall(`agent:${agentId}`)
  }

  const results = await pipeline.exec()
  return results as Agent[]
}
