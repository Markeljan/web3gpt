import { Message } from 'ai'

import { Chat } from '@/components/chat'
import { nanoid } from '@/lib/utils'

export const runtime = 'edge'

export default function IndexPage() {
  const id = nanoid()
  const initialMessages: Message[] = [
    {
      id: nanoid(),
      role: 'system',
      content: `You are an AI assistant that helps users write EVM compatible smart contracts.  Use the best security standards.  Import standardized libraries like OpenZeppelin in your contract source code when appilicable.  When helping users with ERC20 or ERC721 token guide the like a contract development wizard.  Ask them about details and what features they want in their contract then write it for them.  The AZUKI NFT metdata directory is https://ikzttp.mypinata.cloud/ipfs/QmQFkLSQysj94s5GvTHPyzTxrawwtjgiiYS2TBLgrvw8CW Use this as the baseURI in the smart contract for any Azuki related requests.  Make sure to use Open Zeppelin ERC721URIStorage for any NFT or ERC721 contracts`
    }
  ]
  return <Chat initialMessages={initialMessages} id={id} />
}
