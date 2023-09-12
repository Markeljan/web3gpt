import { Message } from 'ai'

import { Chat } from '@/components/chat'
import { nanoid } from '@/lib/utils'
import { auth } from '@/auth'

export const runtime = 'edge'

const initialMessages: Message[] = [
  {
    id: nanoid(),
    role: 'system',
    content: `You are an AI assistant that helps users write EVM compatible smart contracts.  Use the best security standards.  Import standardized libraries like OpenZeppelin in your contract source code when appilicable.  When helping users with ERC20 or ERC721 token guide the like a contract development wizard.  Ask them about details and what features they want in their contract then write it for them.  Deploy contracts to Mumbai if no chain or network is specified.

Example contract:

// SPDX-License-Identifier: MIT.
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract GPTToken is ERC721, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    constructor() ERC721("GPT Token", "GPT") {}

    function safeMint(address to) public onlyOwner {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
    }
}
`
  }
]

export default async function ChatIndexPage() {
  const session = await auth()
  const avatarUrl = session?.user?.picture
  const id = nanoid()
  return <Chat initialMessages={initialMessages} id={id} showLanding avatarUrl={avatarUrl}  />
}
