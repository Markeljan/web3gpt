"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { kv } from "@vercel/kv"

import type { Agent, DbChat, DbChatListItem, VerifyContractParams } from "@/lib/types"

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

export async function getChatList(): Promise<DbChatListItem[] | null> {
  const session = await auth()
  if (!session?.user?.id) {
    return null
  }

  const pipeline = kv.pipeline()
  const chats: string[] = await kv.zrange(`user:chat:${session.user.id}`, 0, -1, {
    rev: true
  })

  for (const chat of chats) {
    pipeline?.hmget<DbChatListItem>(chat, "id", "title", "published", "createdAt", "avatarUrl", "userId")
  }

  const results = await pipeline?.exec<DbChatListItem[]>()

  return results
}

export async function getChat(id: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return null
  }

  return await kv.hgetall<DbChat>(`chat:${id}`)
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

  revalidatePath("/")
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
    return
  }

  const payload = {
    ...chat,
    published: true
  }

  await kv.hmset(`chat:${chat.id}`, payload)

  revalidatePath("/")
  return revalidatePath(`/share/${chat.id}`)
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

export const getAgent = async (id: string) => {
  return await kv.hgetall<Agent>(`agent:${id}`)
}

// store contract deployment.  Saves the ipfs hash of the source files
export const storeDeployment = async (deployData: {
  chainId: string
  deployHash: string
  contractAddress: string
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

export const storeTokenScriptDeployment = async (deployData: {
  chainId: string
  deployHash: string
  cid: string
  tokenAddress: string
}) => {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: "Unauthorized"
    }
  }

  // save to unverified contracts list
  await kv.hmset(`tokenscript:${deployData.cid}`, deployData)

  // add to user's list of deployments
  await kv.zadd(`user:tokenscripts:${session.user.id}`, {
    score: Date.now(),
    member: `tokenscript:${deployData.cid}`
  })
}

export const storeVerification = async (data: Partial<VerifyContractParams>) => {
  const session = await auth()
  if (!session?.user?.id) {
    return {
      error: "Unauthorized"
    }
  }

  await kv.hmset(`verification:${data.deployHash}`, data)
}

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

// delete a verification
export const deleteVerification = async (deployHash: string) => {
  await kv.del(`verification:${deployHash}`)
}
