import { generateId } from "ai"
import { type NextRequest, NextResponse } from "next/server"
import { generateAgentReply } from "@/lib/agent-chat"
import {
  buildChatTitle,
  createTextMessage,
  getLatestAssistantText,
  getResponseText,
  toHistoryItems,
} from "@/lib/chat-utils"
import { DEFAULT_AGENT_ID } from "@/lib/constants"
import { getSkillChat, storeSkillChat } from "@/lib/data/kv"
import type { SkillChat } from "@/lib/types"

export const maxDuration = 60

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

type SkillRequest = {
  agentId?: string
  chatId?: string
  message?: string
  prompt?: string
  history?: boolean
  full?: boolean
}

const parseBoolean = (value: boolean | string | null | undefined): boolean => {
  if (typeof value === "boolean") {
    return value
  }

  return value === "true" || value === "1"
}

const getRequestPayload = async (request: NextRequest): Promise<SkillRequest> => {
  let body: SkillRequest = {}

  if (request.method === "POST") {
    try {
      body = (await request.json()) as SkillRequest
    } catch {
      body = {}
    }
  }

  const { searchParams } = request.nextUrl

  return {
    agentId: body.agentId || searchParams.get("agentId") || undefined,
    chatId: body.chatId || searchParams.get("chatId") || undefined,
    message: body.message || body.prompt || searchParams.get("message") || searchParams.get("prompt") || undefined,
    history: parseBoolean(body.history) || parseBoolean(searchParams.get("history")) || parseBoolean(body.full),
    full: parseBoolean(body.full) || parseBoolean(searchParams.get("full")),
  }
}

const json = (body: unknown, init?: ResponseInit) => {
  const headers = new Headers(CORS_HEADERS)

  if (init?.headers) {
    const initHeaders = new Headers(init.headers)
    for (const [key, value] of initHeaders.entries()) {
      headers.set(key, value)
    }
  }

  return NextResponse.json(body, {
    ...init,
    headers,
  })
}

async function handleSkillRequest(request: NextRequest) {
  const payload = await getRequestPayload(request)
  const includeHistory = payload.full || payload.history
  const chatId = payload.chatId || generateId()
  const requestedAgentId = payload.agentId || DEFAULT_AGENT_ID
  const message = payload.message?.trim()

  const existingChat = await getSkillChat(chatId)
  const activeAgentId = existingChat?.agentId || requestedAgentId
  const session: SkillChat = existingChat || {
    id: chatId,
    agentId: activeAgentId,
    createdAt: Date.now(),
    title: "Skill Chat",
    messages: [],
  }

  if (!message) {
    if (!existingChat) {
      await storeSkillChat(session)
    }

    return json({
      agentId: activeAgentId,
      chatId,
      history: includeHistory ? toHistoryItems(session.messages) : undefined,
      response: getLatestAssistantText(session.messages),
    })
  }

  try {
    const userMessage = createTextMessage("user", message)
    const messages = [...session.messages, userMessage]
    const { result } = await generateAgentReply({
      agentId: activeAgentId,
      messages,
    })

    const assistantText = getResponseText({
      text: result.text,
      responseMessages: result.response.messages,
      toolResults: result.toolResults,
    })
    const nextMessages = assistantText ? [...messages, createTextMessage("assistant", assistantText)] : messages

    await storeSkillChat({
      ...session,
      agentId: activeAgentId,
      messages: nextMessages,
      title: buildChatTitle(nextMessages, "Skill Chat"),
    })

    return json({
      agentId: activeAgentId,
      chatId,
      history: includeHistory ? toHistoryItems(nextMessages) : undefined,
      response: assistantText || null,
    })
  } catch (error) {
    return json(
      {
        agentId: activeAgentId,
        chatId,
        error: error instanceof Error ? error.message : "Failed to complete skill request",
      },
      { status: 500 }
    )
  }
}

export function GET(request: NextRequest) {
  return handleSkillRequest(request)
}

export function POST(request: NextRequest) {
  return handleSkillRequest(request)
}

export function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: CORS_HEADERS,
  })
}
