import { UseChatHelpers } from 'ai/react'

import { Button } from '@/components/ui/button'
import { IconArrowRight } from '@/components/ui/icons'

const exampleMessages = [
  {
    heading: 'ERC20 Wizard',
    message: `Help me write an ERC20 token smart contract.`
  },
  {
    heading: 'ERC721 Wizard',
    message: 'Help me write an ERC721 NFT smart contract.'
  },
  {
    heading: 'Multisig Wizard',
    message: `Help me write a multisig wallet.`
  }
]

export function EmptyScreen({ setInput }: Pick<UseChatHelpers, 'setInput'>) {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="rounded-lg border bg-background p-8">
        <h1 className="mb-2 text-lg font-semibold">
          Welcome to WEB3 GPT!
        </h1>
        <p className="mb-2 leading-normal text-muted-foreground">
          I am a smart contract development assistant.  I can help you write, deploy, and interact with smart contracts on any EVM compatible blockchain.
        </p>
        <p className="leading-normal text-muted-foreground">
          You can start with one of the examples below, or write your own prompt.
        </p>
        <div className="mt-4 flex flex-col items-start space-y-2">
          {exampleMessages.map((message, index) => (
            <Button
              key={index}
              variant="link"
              className="h-auto p-0 text-base"
              onClick={() => setInput(message.message)}
            >
              <IconArrowRight className="mr-2 text-muted-foreground" />
              {message.heading}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
