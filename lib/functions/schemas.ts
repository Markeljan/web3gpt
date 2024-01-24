import { ChatRequestOptions } from 'ai'
export const functionSchemas: ChatRequestOptions['functions'] = [
  {
    name: 'deploy_contract',
    description: 'Deploy a smart contract',
    parameters: {
      type: 'object',
      description: `This function deploys a smart contract to an EVM compatible chain.  It returns the tx hash of the deployment and an IPFS url to a directory of files used for the contract.  Only call this function in a separate chat message do not call it from a message with other text.  Share the explorer url and ipfs url with the user.`,
      properties: {
        contractName: {
          type: 'string'
        },
        chainId: {
          type: 'string',
          description: `Do not use this parameter unless the user specificaly specifies it!
          Supported chainIds:
          5: goerli,
          84531: base goerli,
          80001: mumbai,
          11155111: sepolia,
          `
          // 421613: arbitrum goerli removed due to trannsaction building issues
        },
        sourceCode: {
          type: 'string',
          description:
            'Source code of the smart contract. Format as a single-line string, with all line breaks and quotes escaped to be valid stringified JSON.'
        },
        constructorArgs: {
          type: 'array',
          items: {
            oneOf: [
              {
                type: 'string'
              },
              {
                type: 'array',
                items: {
                  type: 'string'
                }
              }
            ]
          },
          description:
            "Array of arguments for the contract's constructor. Each Array item a string or an array of strings.  Empty array if the constructor has no arguments."
        }
      },
      required: ['contractName', 'sourceCode', 'constructorArgs']
    }
  },
  {
    name: 'text_to_image',
    description: `This function generates an image from text.  Only call this function in a separate chat message do not call it from a message with other text.  Show the image to the user using the default IPFS gateway ipfs.io/ipfs/{CID} in markdown.  Use the metadata as the baseTokenURI if creating an NFT.`,
    parameters: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'Text to generate an image from.'
        }
      },
      required: ['text']
    }
  }
]
