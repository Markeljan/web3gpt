const { kv } = require('@vercel/kv')
const { Configuration, OpenAIApi } = require('openai-edge')
const { Message, OpenAIStream, StreamingTextResponse } = require('ai')

const { auth } = require('@/auth')
const { nanoid } = require('@/lib/utils')

export const runtime = 'edge'

export async function POST(req: Request) {
  const json = await req.json()
  const { functions, function_call } = json
  const userId = (await auth())?.user.id

  if (!userId) {
    return new Response('Unauthorized', { status: 401 })
  }

  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
  })

  const openai = new OpenAIApi(configuration)

  // Prepare a system message that filters questions
  const systemMessage = {
    role: 'system',
    content:
      'You are a helpful assistant that knows about web3, blockchain, and smart contracts. Please answer any questions related to these topics and review and audit smart contract against any vulnerability and check function and variable names that is correct and security and functionality and check if code is organized. Update the smart contract with updates in auditing. At the end of the answer give me feedback that you audited the smart contract and there is not any vulnerability. If the question is not related to web3, blockchain, or smart contracts, answer with "I don\'t know".'
  }

  // Append the system message to the existing messages array
  const messages = json.messages
    ? [...json.messages, systemMessage]
    : [systemMessage]

  // Ask OpenAI for a streaming chat completion given the prompt
  const res = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    temperature: 0,
    stream: true,
    messages,
    max_tokens: undefined, // defaults to infinity as per https://platform.openai.com/docs/api-reference/chat/create#chat/create-max_tokens
    functions,
    function_call
  })

  let smartContractSourceCode = '' // To store the extracted smart contract, if found.

  const stream = OpenAIStream(res, {
    async onCompletion(completion: any) {
      const title = messages
        .find(m => m.role !== 'system')
        ?.content.substring(0, 100)
      const id = json.id ?? nanoid()
      const createdAt = Date.now()
      const path = `/chat/${id}`

      // Check if the completion contains any smart contract code
      const smartContractPattern =
        /<YOUR_SMART_CONTRACT_SOURCE_CODE_GOES_HERE>/g
      const match = completion.content.match(smartContractPattern)

      // If the smart contract code is found, extract it and store it in the smartContractSourceCode variable
      if (match && match.length > 0) {
        smartContractSourceCode = match[0]
          .replace(smartContractPattern, '')
          .trim()
      }

      const contractAuditPrompt = {
        role: 'user',
        content: smartContractSourceCode // Use the extracted smart contract code here
      }

      // Append the contract auditing prompt to the messages array
      messages.push(contractAuditPrompt)

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
