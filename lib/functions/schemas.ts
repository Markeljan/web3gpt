import { ChatCompletionFunctions } from "openai-edge";

export const functionSchemas: ChatCompletionFunctions[] = [
    {
        name: 'get_current_time',
        description: 'Get the current time',
        parameters: {
            type: 'object',
            properties: {},
            required: []
        }
    },
    {
        name: 'deploy_contract',
        description: 'Deploy a smart contract',
        parameters: {
            type: 'object',
            description: 'The parameters the functions accepts, described as a JSON Schema object. See the guide for examples, and the JSON Schema reference for documentation about the format.',
            properties: {
                contractName: {
                    type: 'string',
                },
                chainName: {
                    type: 'string',
                    description: 'Name of the EVM compatible chain we are deploying to.  Default to Sepolia if not specified.'
                },
                sourceCode: {
                    "type": "string",
                    "description": "Source code of the smart contract. Use Solidity v0.8.20+ and ensure that it is the full source code and will compile. The source code should be formatted as a single-line string, with all line breaks and quotes escaped to be valid in a JSON context. Specifically, newline characters should be represented as '\\n', and double quotes should be escaped as '\\\"'."
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
                    description: 'Arguments for the contract\'s constructor. Each argument can be a string or an array of strings. But the final constructor arguments must be an array.  Can be empty array if the constructor has no arguments.'
                }

            },
            required: ['contractName', 'chainName', 'sourceCode', 'constructorArgs']
        }
    },
]   