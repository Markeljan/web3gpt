import { openai } from "@ai-sdk/openai"
import { type NextRequestWithUnkeyContext, withUnkey } from "@unkey/nextjs"
import { track } from "@vercel/analytics/server"
import { generateObject, generateText } from "ai"
import { NextResponse } from "next/server"
import type { Abi, Hex } from "viem"
import { z } from "zod"

import { compileContract } from "@/lib/actions/deploy-contract"
import { metisSepolia } from "@/lib/config"
import { deployContract } from "@/lib/solidity/deploy"

const UNKEY_CONTRACTS_API_ID = process.env.UNKEY_CONTRACTS_API_ID

if (!UNKEY_CONTRACTS_API_ID) {
  throw new Error("UNKEY_CONTRACTS_API_ID is not set")
}

export const maxDuration = 60

interface ContractDeployRequest {
  prompt: string
  chainId?: number
}

interface CompilationResult {
  abi: Abi
  bytecode: Hex
  standardJsonInput: string
  sources: {
    [fileName: string]: {
      content: string
    }
  }
}

export const POST = withUnkey(
  async (req: NextRequestWithUnkeyContext) => {
    // Set CORS headers
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    }

    // Validate API key
    if (!req.unkey?.valid) {
      return new NextResponse("unauthorized get api key at https://t.me/w3gptai", {
        status: 403,
        headers,
      })
    }

    try {
      // Extract request parameters
      const { prompt, chainId = metisSepolia.id } = (await req.json()) as ContractDeployRequest

      // Validate prompt
      if (!prompt || typeof prompt !== "string") {
        return new NextResponse("Prompt is required and must be a string", {
          status: 400,
          headers,
        })
      }

      const { keyId = "unknown_key", remaining = 0, ownerId = "unknown_owner" } = req.unkey

      // Track analytics
      track("contract_deploy_request", {
        apiId: UNKEY_CONTRACTS_API_ID,
        keyId,
        ownerId,
        remaining,
      })

      // Generate contract source code
      let { contractName, sourceCode } = (
        await generateObject({
          system: `You are an expert Solidity smart contract developer as an API. Given a prompt, generate fully working, raw, ready to compile Solidity code. 
            Source code of the smart contract. Format as a single-line string, with all line breaks and quotes escaped to be valid stringified JSON. 
            
            Generate complete, compilable smart contract code.

            Use OpenZeppelin@4.9.3 for all ERC20, ERC721, ERC1155 token contracts.
            
            Use OpenZeppelin contracts version 4.9.3 to avoid breaking changes. Format imports as: import "@openzeppelin/contracts@4.9.3/token/ERC20/ERC20.sol";
            
            Do not use local imports (e.g., './' or '../') in the generated code.

            By default use SPDX License Identifier MIT and the latest available fixed Solidity version.`,
          prompt,
          model: openai.responses("gpt-4o"),
          schema: z.object({
            contractName: z.string().describe("The name of the contract"),
            sourceCode: z
              .string()
              .describe("The raw source code of the contract that will be compiled and deployed.")
              .transform((code) => {
                let cleanedCode = code.trim()
                // Remove code fence markers at beginning
                if (cleanedCode.startsWith("```solidity")) {
                  cleanedCode = cleanedCode.substring("```solidity".length)
                } else if (cleanedCode.startsWith("```")) {
                  cleanedCode = cleanedCode.substring("```".length)
                }

                // Remove code fence markers at end
                if (cleanedCode.endsWith("```")) {
                  cleanedCode = cleanedCode.substring(0, cleanedCode.length - 3)
                }

                // Final trim to remove any leading/trailing whitespace
                return cleanedCode.trim()
              }),
          }),
        })
      ).object

      let compilationResult: CompilationResult | undefined
      let retryCount = 0
      const maxRetries = 5

      // Attempt compilation with retries
      while (retryCount < maxRetries) {
        try {
          compilationResult = await compileContract({
            contractName,
            sourceCode,
          })
          break
        } catch (error: unknown) {
          if (retryCount === maxRetries - 1) {
            return new NextResponse(
              JSON.stringify({
                error: "Contract compilation failed",
                details: error instanceof Error ? error.message : "Unknown error",
              }),
              { status: 400, headers },
            )
          }

          // Generate fixed contract based on error using predicted outputs
          const errorMessage = error instanceof Error ? error.message : "Unknown error"
          const fixPrompt = `Fix this Solidity contract that has the following error: ${errorMessage}`

          const { text: fixedCode, providerMetadata } = await generateText({
            system:
              "You are an expert Solidity smart contract developer. Fix the contract and return only the fixed code without any explanations. DO NOT include markdown code blocks or code fence markers (```) in your response. The output must be pure, valid Solidity code only.",
            prompt: fixPrompt,
            model: openai.responses("gpt-4o"),
            providerOptions: {
              openai: {
                prediction: {
                  type: "content",
                  content: sourceCode,
                },
                store: true,
                user: keyId,
              },
            },
          })

          console.log(`Fix attempt ${retryCount + 1} - OpenAI response ID: ${providerMetadata?.openai?.responseId}`)

          // Clean the fixed code to ensure no markdown or code fence markers remain
          let cleanedFixedCode = fixedCode.trim()
          if (cleanedFixedCode.startsWith("```solidity")) {
            cleanedFixedCode = cleanedFixedCode.substring("```solidity".length)
          } else if (cleanedFixedCode.startsWith("```")) {
            cleanedFixedCode = cleanedFixedCode.substring("```".length)
          }

          if (cleanedFixedCode.endsWith("```")) {
            cleanedFixedCode = cleanedFixedCode.substring(0, cleanedFixedCode.length - 3)
          }

          sourceCode = cleanedFixedCode.trim()
          retryCount++
        }
      }

      if (!compilationResult) {
        return new NextResponse(
          JSON.stringify({
            error: "Failed to compile contract after multiple attempts",
          }),
          { status: 400, headers },
        )
      }

      const { explorerUrl, ipfsUrl } = await deployContract({
        chainId: chainId.toString(),
        contractName,
        sourceCode,
        constructorArgs: [],
      })

      return NextResponse.json(
        {
          ipfsUrl,
          explorerUrl,
        },
        { headers },
      )
    } catch (error) {
      console.error("Contract generation/deployment error:", error)
      return new NextResponse(
        JSON.stringify({
          error: "An error occurred during contract generation/deployment",
          details: error instanceof Error ? error.message : "Unknown error",
        }),
        { status: 500, headers },
      )
    }
  },
  {
    handleInvalidKey(req, result) {
      console.log("handleInvalidKey", req, result)
      return new NextResponse("Unauthorized get api key at https://t.me/w3gptai", {
        status: 403,
      })
    },
    disableTelemetry: true,
    apiId: UNKEY_CONTRACTS_API_ID,
  },
)

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}
