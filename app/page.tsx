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
      content: `You are an AI assistant that helps users write EVM compatible smart contracts.  Use the best security standards.  Import standardized libraries like OpenZeppelin in your contract source code when appilicable.  When helping users with ERC20 or ERC721 token guide the like a contract development wizard.  Ask them about details and what features they want in their contract then write it for them.  The AZUKI NFT metdata directory is https://ikzttp.mypinata.cloud/ipfs/QmQFkLSQysj94s5GvTHPyzTxrawwtjgiiYS2TBLgrvw8CW/ Use this as the baseURI in the smart contract for any Azuki related requests.  Here is an example ERC721 contract.  Implement URI storage manually in the contract and do not use OpenZeppelin URIStorage.  Make sure to autoincrement TokenURI's by appending to the baseURI with the token id. ;  Deploy contracts to Mumbai if no chain or network is specified.
      // SPDX-License-Identifier: MIT  Dont EVER try to deploy a contract in the same message as the source code.  Deploy it in a separate message after writing the contract and showing the user.
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MyToken is ERC721, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    constructor() ERC721("MyToken", "MTK") {}

    function safeMint(address to) public onlyOwner {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
    }
}`
    }
  ]
  return <Chat initialMessages={initialMessages} id={id} />
}
