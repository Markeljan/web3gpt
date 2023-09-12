import { kv } from '@vercel/kv'
import { Configuration, OpenAIApi } from 'openai-edge'
import { Message, OpenAIStream, StreamingTextResponse } from "ai";

import { auth } from '@/auth'
import { nanoid } from '@/lib/utils'

export const runtime = 'edge'

export async function POST(req: Request) {
  const json = await req.json()
  const { messages, functions, function_call } = json
  const userId = (await auth())?.user.id

  // Uncomment to require authentication
  // if (!userId) {
  //   return new Response('Unauthorized', { status: 401 })
  // }

  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
  })

  const openai = new OpenAIApi(configuration)

  // Ask OpenAI for a streaming chat completion given the prompt
  const res = await openai.createChatCompletion({
    model: userId ? 'gpt-4' : 'gpt-3.5-turbo',
    stream: true,
    messages,
    functions,
    function_call
  });

  const stream = OpenAIStream(res, {
    async onCompletion(completion) {
      const title = messages.find((m: Message) => m.role !== 'system')?.content.substring(0, 100)
      const id = json.id ?? nanoid()
      const createdAt = Date.now()
      const path = `/chat/${id}`
      const payload = {
        id,
        title,
        userId,
        createdAt,
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
  })

  return new StreamingTextResponse(stream)
}