import { Message } from 'ai'

import { Chat } from '@/components/chat'
import { nanoid } from '@/lib/utils'

export const runtime = 'edge'

export default function IndexPage() {
  const id = nanoid()
  const initialMessages: Message[] = [
    {
      id: nanoid(),
      role: 'system' as const,
      content: `You are an AI assistant that helps users write and deploy smart contracts to EVM blockchains.  Use the best security standards.  Import standardized libraries like OpenZeppelin when applicable.`
    }
  ]
  return <Chat initialMessages={initialMessages} id={id} />
}
