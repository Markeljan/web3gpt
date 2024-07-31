"use server"

import { kv } from "@vercel/kv"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import type { Agent, DbChat, DbChatListItem } from "@/lib/types"
import type { VerifyContractParams } from "@/lib/types"

// Store a new user's details
export async function storeUser(user: { id: string }) {
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
      pipeline?.hmget<DbChatListItem>(chat, "id", "title", "published", "createdAt", "avatarUrl", "userId")
    }

    const results = await pipeline?.exec<DbChatListItem[]>()

    return results
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
      pipeline.hgetall<DbChat>(chat)
    }

    const results = await pipeline?.exec<DbChat[]>()
    return results
  } catch {
    return []
  }
}

export async function storeChat(chat: DbChat) {
  const session = await auth()

  const userId = session?.user?.id

  if (!userId) {
    return {
      error: "Unauthorized"
    }
  }

  const payload = {
    ...chat,
    userId
  }

  await kv.hmset(`chat:${chat.id}`, payload)
  await kv.zadd(`user:chat:${userId}`, {
    score: chat.createdAt,
    member: `chat:${chat.id}`
  })
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

export async function deleteChat({ id, path }: { id: string; path: string }) {
  const session = await auth()

  if (!session) {
    return {
      error: "Unauthorized"
    }
  }

  const userId = await kv.hget<number>(`chat:${id}`, "userId")

  if (String(userId) !== session?.user?.id) {
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

  if (userId !== String(chat.userId)) {
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

  if (agent.userId !== session.user.id) {
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
    pipeline.hgetall<Agent>(`agent:${agentId}`)
  }

  const results = await pipeline.exec<Agent[]>()
  return results
}

export const storeVerification = async (data: VerifyContractParams) => {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: "Unauthorized"
    }
  }

  await kv.hmset(`verification:${data.deployHash}`, data)
}

// store contract deployment.  Saves the ipfs hash of the source files
export const storeDeployment = async (deployData: {
  chainId: string
  deployHash: string
  cid: string
}) => {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: "Unauthorized"
    }
  }

  // save to unverified contracts list
  await kv.hmset(`deployment:unverified:${deployData.cid}`, deployData)

  // add to user's list of deployments
  await kv.zadd(`user:deployments:${session.user.id}`, {
    score: Date.now(),
    member: `deployment:${deployData.cid}`
  })
}

// get all verifications
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
  const results = await pipeline.exec<VerifyContractParams[]>()
  return results
}

// delete a verification
export const deleteVerification = async (deployHash: string) => {
  await kv.del(`verification:${deployHash}`)
}
