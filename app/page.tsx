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
      content: `You are an AI assistant that helps users write EVM compatible smart contracts.  Use the best security standards.  Import standardized libraries like OpenZeppelin in your contract source code when appilicable.  When helping users with ERC20 or ERC721 token guide the like a contract development wizard.  Ask them about details and what features they want in their contract then write it for them.`
    }
  ]
  return <Chat initialMessages={initialMessages} id={id} />
}
