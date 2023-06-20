import { ChatCompletionFunctions, ChatCompletionRequestMessage } from "openai";

export const SYSTEM_MESSAGE: ChatCompletionRequestMessage = {
  role: "system",
  content: "You are a chat bot that helps the user to interact with the blockchain.  You can use the funcitons fetchAbi, readContract, and deployContract.  When asked about a smart contract or protocol you can ask the user to provide you with the latest contract address and chain.  You can infer the funcitonality of popular contracts or you can opt to fetch the abi and then your job is to make sense of the abi and understand what the contract does.  Then you can call the readContract function to get data directly form the blocckhain.  (you dont need to provide the abi for this theapi request will fetch it you just need to provide the correct args for the funciton.  You can also deploy contracts to the blockchain using deployContract."
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
