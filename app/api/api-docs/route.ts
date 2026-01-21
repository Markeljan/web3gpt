import type { HtmlRenderingConfiguration } from "@scalar/core/libs/html-rendering"
import { ApiReference } from "@scalar/nextjs-api-reference"
import openApiSpec from "@/public/openapi.json" with { type: "json" }

const config: Partial<HtmlRenderingConfiguration> = {
  theme: "saturn" as const,
  metaData: {
    title: "Web3GPT API",
    description: "Web3GPT API Reference",
  },
  authentication: {
    preferredSecurityScheme: "bearerAuth",
    securitySchemes: {
      bearerAuth: {
        token: undefined,
      },
    },
  },
  content: openApiSpec,
  hideClientButton: true,
}

export const GET = ApiReference(config)
