import { openai } from "@ai-sdk/openai"
import { type NextRequestWithUnkeyContext, withUnkey } from "@unkey/nextjs"
import { track } from "@vercel/analytics/server"
import { generateText, streamText } from "ai"
import { NextResponse } from "next/server"

const UNKEY_COMPLETIONS_API_ID = process.env.UNKEY_COMPLETIONS_API_ID

export const maxDuration = 30

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
      const { prompt, stream = false, system } = await req.json()

      // Validate prompt
      if (!prompt || typeof prompt !== "string") {
        return new NextResponse("Prompt is required and must be a string", {
          status: 400,
          headers,
        })
      }

      const { keyId = "unknown_key", remaining = 0, ownerId = "unknown_owner" } = req.unkey

      track("completions_request", {
        apiId: UNKEY_COMPLETIONS_API_ID,
        keyId,
        ownerId,
        remaining,
        stream,
      })

      // Handle streaming completion
      if (stream) {
        const result = streamText({
          system,
          prompt,
          model: openai("gpt-4.1"),
        })

        const response = result.toDataStreamResponse()
        // Add CORS headers to stream response
        response.headers.set("Access-Control-Allow-Origin", "*")
        return response
      }

      // Handle non-streaming completion
      const { text } = await generateText({
        system,
        prompt,
        model: openai("gpt-4.1"),
      })

      return NextResponse.json({ text }, { headers })
    } catch (error) {
      console.error("Completion error:", error)
      return new NextResponse("An error occurred while generating the completion", {
        status: 500,
        headers,
      })
    }
  },
  {
    handleInvalidKey(_req, _result) {
      return new NextResponse("Unauthorized get api key at https://t.me/w3gptai", {
        status: 403,
      })
    },
    disableTelemetry: true,
    apiId: UNKEY_COMPLETIONS_API_ID,
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
