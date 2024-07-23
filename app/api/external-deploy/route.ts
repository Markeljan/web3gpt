import { type NextRequest, NextResponse } from "next/server"

import { parseEther } from "viem"
import { sepolia } from "viem/chains"

import { WEB3GPT_API_SECRET } from "@/lib/config-server"
import { deployContract } from "@/lib/functions/deploy-contract/deploy-contract"

export const runtime = "nodejs"

type ContractBuilderParams = {
  ownerAddress: string
  name?: string
  symbol?: string
  maxSupply?: number
  mintPrice?: number
  baseURI?: string
}

const contractBuilder = ({
  ownerAddress,
  name = "NFT",
  symbol = "NFT",
  maxSupply = 1000,
  mintPrice = Number(parseEther("0.001")),
  baseURI = "ipfs://"
}: ContractBuilderParams) => {
  const sourceCode = `// SPDX-License-Identifier: MIT
    pragma solidity ^0.8.0;

    import "@openzeppelin/contracts@4.9.3/token/ERC721/extensions/ERC721URIStorage.sol";
    import "@openzeppelin/contracts@4.9.3/access/Ownable.sol";
    import "@openzeppelin/contracts@4.9.3/utils/Counters.sol";

    contract ConfigurableNFT is ERC721URIStorage, Ownable {
        using Counters for Counters.Counter;

        Counters.Counter private _tokenIdCounter;

        uint256 public immutable MAX_SUPPLY;
        uint256 public immutable MINT_PRICE;

        string private baseTokenURI;

        constructor(
            address owner,
            string memory name,
            string memory symbol,
            uint256 maxSupply,
            uint256 mintPrice,
            string memory initialBaseURI
        ) ERC721(name, symbol) {
            MAX_SUPPLY = maxSupply;
            MINT_PRICE = mintPrice;
            setBaseURI(initialBaseURI);
            transferOwnership(owner);
        }

        function mintNFT() public payable {
            require(_tokenIdCounter.current() < MAX_SUPPLY, "Max supply reached");
            require(msg.value >= MINT_PRICE, "Ether sent is not correct");

            uint256 tokenId = _tokenIdCounter.current();
            _tokenIdCounter.increment();
            _safeMint(msg.sender, tokenId);
            _setTokenURI(tokenId, string(abi.encodePacked(baseTokenURI, Strings.toString(tokenId))));
        }

        function setBaseURI(string memory newBaseURI) public onlyOwner {
            baseTokenURI = newBaseURI;
        }

        function _baseURI() internal view override returns (string memory) {
            return baseTokenURI;
        }

        function withdraw() public onlyOwner {
            uint256 balance = address(this).balance;
            payable(owner()).transfer(balance);
        }
    }
  `

  const constructorArgs = [ownerAddress, name, symbol, maxSupply?.toString(), mintPrice?.toString(), baseURI]

  return { sourceCode, constructorArgs }
}
export async function POST(req: NextRequest) {
  const apiSecret = req.headers.get("web3gpt-api-key")
  if (apiSecret !== WEB3GPT_API_SECRET) {
    return NextResponse.json({ error: "Unauthorized: invalid web3gpt-api-key" }, { status: 401 })
  }
  const json = await req.json()

  const { ownerAddress, size, price, baseUri, name, symbol } = json

  if (!ownerAddress) {
    return NextResponse.json({ error: "OwnerAddress missing in body" }, { status: 400 })
  }

  const { sourceCode, constructorArgs } = contractBuilder({
    ownerAddress,
    name,
    symbol,
    maxSupply: size,
    mintPrice: price,
    baseURI: baseUri
  })

  const chainId = sepolia.id.toString()

  try {
    const deployResult = await deployContract({
      chainId,
      contractName: "ConfigurableNFT",
      sourceCode,
      constructorArgs
    })
    return new Response(JSON.stringify(deployResult))
  } catch (error) {
    const err = error as Error
    console.error(`Error in deployContract external: ${err.message}`)
    return new Response(JSON.stringify({ error: `Error in deployContract external: ${err.message}` }), { status: 500 })
  }
}

export const OPTIONS = async (req: NextRequest) => {
  return NextResponse.json("", {
    status: 200
  })
}
