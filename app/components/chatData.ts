import { ChatCompletionFunctions, ChatCompletionRequestMessage } from "openai";

export const SYSTEM_MESSAGE: ChatCompletionRequestMessage = {
  role: "system",
  content: "You are a chat bot responsible for writing and deploying smart contracts on EVM compatible chains, as well as reading from these chains. Your main functions are 'deployContract' and 'readContract'. 'deployContract' deploys Solidity smart contracts (version 0.8.20 or greater) onto specified blockchain networks, while 'readContract' interacts with blockchain data. Both functions require parameters to be formatted as per the defined structure. Remember, your primary task is to aid in the development, deployment, and interaction with smart contracts. After you deploy a contract, you should provide the user with the contract address, transaction hash, and IPFS link."
};


export const readContractFunction: ChatCompletionFunctions = {
  "name": "readContract",
  "description": "Read data from a contract on EVM compatible chains.",
  "parameters": {
    "type": "object",
    "properties": {
      "chain": {
        "type": "string",
        "description": "The name of the chain to read data from."
      },
      "requests": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "address": {
              "type": "string",
              "description": "The address of the contract to read data from."
            },
            "functionName": {
              "type": "string",
              "description": "The name of the function in the contract to call."
            },
            "functionArgs": {
              "type": "array",
              "items": {
                "oneOf": [
                  {
                    "type": "string",
                    "description": "A single parameter value can be a string, number, or boolean address, etc."
                  },
                  {
                    "type": "array",
                    "items": {
                      "type": "string"
                    },
                    "description": "A single parameter that has multiple values like multiple addresses for a multisig."
                  }
                ]
              },
              "description": "The arguments for the contract function. Use an array of strings for multiple arguments. Empty [] if no arguments are required.  Only use a nested array if the argument type is an array."
            }
          },
          "required": ["address", "functionName", "functionArgs"]
        },
        "description": "The list of requests for reading data from contracts."
      }
    },
    "required": ["chain", "requests"]
  }
};

export const fetchAbiFunction: ChatCompletionFunctions = {
  "name": "fetchAbi",
  "description": "Fetch the ABI of a deployed smart contract on a specified EVM-compatible blockchain.",
  "parameters": {
    "type": "object",
    "properties": {
      "chain": {
        "type": "string",
        "description": "The name of the blockchain network where the contract is deployed."
      },
      "address": {
        "type": "string",
        "description": "The blockchain address where the smart contract is deployed."
      }
    },
    "required": ["chain", "address"]
  }
}


export const deployContractFunction: ChatCompletionFunctions = {
  "name": "deployContract",
  "description": "Deploy a smart contract. Must be Solidity version 0.8.20 or greater.",
  "parameters": {
    "type": "object",
    "properties": {
      "name": {
        "type": "string",
        "description": "The name of the contract. Only letters, no spaces or special characters."
      },
      "chains": {
        "type": "array",
        "items": {
          "type": "string"
        },
        "description": "The blockchain networks to deploy the contract to. No special characters."
      },
      "sourceCode": {
        "type": "string",
        "description": "The source code of the contract. Must be Solidity version 0.8.20 or greater."
      },
      "constructorArgs": {
        "type": "array",
        "items": {
          "oneOf": [
            {
              "type": "string",
              "description": "A single argument for the contract's constructor."
            },
            {
              "type": "array",
              "items": {
                "type": "string"
              },
              "description": "An array of arguments for the contract's constructor."
            }
          ]
        },
        "description": "The arguments for the contract's constructor. Can be of any type represented as a string. Empty [] if no arguments are required."
      }
    },
    "required": ["name", "chains", "sourceCode", "constructorArgs"]
  }
}
