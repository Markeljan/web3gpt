import { ApiReference } from "@scalar/nextjs-api-reference"
import openApiSpec from "@/public/openapi.json" with { type: "json" }

const config = {
  theme: "saturn" as const,
  metaData: {
    title: "Web3GPT API",
    description: "Web3GPT API Reference",
  },
  authentication: {
    http: {
      bearer: {
        token: undefined,
      },
      basic: {
        username: "",
        password: "",
      },
    },
    securitySchemes: {
      bearer: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "Bearer",
      },
    },
    preferredSecurityScheme: "bearerAuth",
  },
  spec: {
    content: openApiSpec,
  },
  hideClientButton: true,
}

export const GET = ApiReference(config)
