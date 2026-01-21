import { openai } from "@ai-sdk/openai"
import { type NextRequestWithUnkeyContext, withUnkey } from "@unkey/nextjs"
import { track } from "@vercel/analytics/server"
import { generateText, Output } from "ai"
import { NextResponse } from "next/server"
import type { Abi, Hex } from "viem"
import { metisSepolia } from "viem/chains"
import { z } from "zod"
import { compileContract } from "@/lib/actions/deploy-contract"
import { deployContract } from "@/lib/solidity/deploy"

type ContractDeployRequest = {
  prompt: string
  chainId?: number
}

type CompilationResult = {
  abi: Abi
  bytecode: Hex
  standardJsonInput: string
  sources: {
    [fileName: string]: {
      content: string
    }
  }
}

const UNKEY_ROOT_KEY = process.env.UNKEY_ROOT_KEY

const ALLOW_CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

if (!UNKEY_ROOT_KEY) {
  throw new Error("UNKEY_ROOT_KEY is not set")
}

export const maxDuration = 60

const MAX_RETRIES = 5

const SYSTEM_PROMPT = `You are an expert Solidity smart contract developer as an API. Given a prompt, generate fully working, raw, ready to compile Solidity code. 
Source code of the smart contract. Format as a single-line string, with all line breaks and quotes escaped to be valid stringified JSON. 

Generate complete, compilable smart contract code.

Use OpenZeppelin@4.9.3 for all ERC20, ERC721, ERC1155 token contracts.

Use OpenZeppelin contracts version 4.9.3 to avoid breaking changes. Format imports as: import "@openzeppelin/contracts@4.9.3/token/ERC20/ERC20.sol";

Do not use local imports (e.g., './' or '../') in the generated code.

By default use SPDX License Identifier MIT and the latest available fixed Solidity version.  Current version is 0.8.29.`

const FIX_SYSTEM_PROMPT =
  "You are an expert Solidity smart contract developer. Fix the contract and return only the fixed code without any explanations. DO NOT include markdown code blocks or code fence markers (```) in your response. The output must be pure, valid Solidity code only. Current version is 0.8.29."

function stripCodeFences(code: string): string {
  let cleaned = code.trim()
  if (cleaned.startsWith("```solidity")) {
    cleaned = cleaned.substring("```solidity".length)
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.substring("```".length)
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3)
  }
  return cleaned.trim()
}

const contractSchema = z.object({
  contractName: z.string().describe("The name of the contract"),
  sourceCode: z
    .string()
    .describe("The raw source code of the contract that will be compiled and deployed.")
    .transform(stripCodeFences),
})

async function generateFixedCode(errorMessage: string, sourceCode: string, keyId: string): Promise<string> {
  const fixPrompt = `Fix this Solidity contract that has the following error: ${errorMessage}`
  const { text: fixedCode } = await generateText({
    system: FIX_SYSTEM_PROMPT,
    prompt: fixPrompt,
    model: openai.responses("gpt-5-mini"),
    providerOptions: {
      openai: {
        prediction: { type: "content", content: sourceCode },
        store: true,
        user: keyId,
      },
    },
  })
  return stripCodeFences(fixedCode)
}

async function compileWithRetries(
  contractName: string,
  initialSourceCode: string,
  keyId: string
): Promise<{ result: CompilationResult; sourceCode: string } | { error: string }> {
  let sourceCode = initialSourceCode

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const result = await compileContract({ contractName, sourceCode })
      return { result, sourceCode }
    } catch (error: unknown) {
      const isLastAttempt = attempt === MAX_RETRIES - 1
      if (isLastAttempt) {
        return { error: error instanceof Error ? error.message : "Unknown error" }
      }
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      sourceCode = await generateFixedCode(errorMessage, sourceCode, keyId)
    }
  }

  return { error: "Failed to compile contract after multiple attempts" }
}

export const POST = withUnkey(
  async (req: NextRequestWithUnkeyContext) => {
    if (!req.unkey?.data?.valid) {
      return new NextResponse("unauthorized get api key at https://t.me/w3gptai", {
        status: 403,
        headers: ALLOW_CORS_HEADERS,
      })
    }

    try {
      const { prompt, chainId = metisSepolia.id } = (await req.json()) as ContractDeployRequest

      if (!prompt || typeof prompt !== "string") {
        return new NextResponse("Prompt is required and must be a string", {
          status: 400,
          headers: ALLOW_CORS_HEADERS,
        })
      }

      const { keyId = "unknown_key", credits = 0, identity } = req.unkey.data

      track("contract_deploy_request", {
        keyId,
        externalId: identity?.externalId || "unknown_external_id",
        credits,
      })

      const result = await generateText({
        system: SYSTEM_PROMPT,
        prompt,
        model: openai.responses("gpt-5-mini"),
        output: Output.object({ schema: contractSchema }),
      })

      const outputData = result.output ?? { contractName: "", sourceCode: "" }
      const contractName = "contractName" in outputData ? outputData.contractName : ""
      const sourceCode = "sourceCode" in outputData ? outputData.sourceCode : ""

      const compilationResult = await compileWithRetries(contractName, sourceCode, keyId)

      if ("error" in compilationResult) {
        return new NextResponse(
          JSON.stringify({ error: "Contract compilation failed", details: compilationResult.error }),
          { status: 400, headers: ALLOW_CORS_HEADERS }
        )
      }

      const { explorerUrl, ipfsUrl } = await deployContract({
        chainId,
        contractName,
        sourceCode: compilationResult.sourceCode,
        constructorArgs: [],
      })

      return NextResponse.json({ ipfsUrl, explorerUrl }, { headers: ALLOW_CORS_HEADERS })
    } catch (error) {
      return new NextResponse(
        JSON.stringify({
          error: "An error occurred during contract generation/deployment",
          details: error instanceof Error ? error.message : "Unknown error",
        }),
        { status: 500, headers: ALLOW_CORS_HEADERS }
      )
    }
  },
  {
    handleInvalidKey() {
      return new NextResponse("Unauthorized get api key at https://t.me/w3gptai", { status: 403 })
    },
    rootKey: UNKEY_ROOT_KEY,
  }
)

// Handle CORS preflight requests
export function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: ALLOW_CORS_HEADERS,
  })
}
