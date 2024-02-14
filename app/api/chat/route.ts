import { kv } from '@vercel/kv'
import { Message, OpenAIStream, StreamingTextResponse } from 'ai'
import OpenAI from 'openai'
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions'

import { auth } from '@/auth'
import { nanoid } from '@/lib/utils'

export const runtime = 'edge'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(req: Request) {
  const json = await req.json()
  const { messages, functions } = json
  const session = await auth()
  const { id: userId, image: avatarUrl } = session?.user ?? {}

  // Limit the number of messages to 30, removing from the middle of the array
  function limitedMessagesArray(messages: ChatCompletionMessageParam[]) {
    const messageLimit = 30

    if (messages.length > messageLimit) {
      const numberOfElementsToRemove = messages.length - messageLimit
      const startIndex = Math.floor(
        (messages.length - numberOfElementsToRemove) / 2
      )
      messages.splice(startIndex, numberOfElementsToRemove)
    }

    return messages
  }

  const res = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    stream: true,
    messages: limitedMessagesArray(messages),
    functions
  })

  const stream = OpenAIStream(res, {
    async onCompletion(completion) {
      if (userId) {
        const title = messages
          .find((m: Message) => m.role !== 'system')
          ?.content.substring(0, 100)
        const id = String(json.id ?? nanoid())
        const createdAt = Date.now()
        const path = `/chat/${id}`
        const payload = {
          id,
          title,
          userId,
          createdAt,
          avatarUrl,
          path,
          messages: [
            ...messages,
            {
              content: completion,
              role: 'assistant'
            }
          ]
        }
        await kv.hmset(`chat:${id}`, payload)
        await kv.zadd(`user:chat:${userId}`, {
          score: createdAt,
          member: `chat:${id}`
        })
      }
    }
  })

  return new StreamingTextResponse(stream)
}
