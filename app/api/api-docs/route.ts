import { ApiReference } from "@scalar/nextjs-api-reference"
import openApiSpec from "@/public/openapi.json"

const isProduction = process.env.NODE_ENV === "production"
const UNKEY_CONTRACTS_API_KEY = process.env.UNKEY_CONTRACTS_API_KEY

const config = {
  theme: "saturn" as const,
  metaData: {
    title: "Web3GPT API",
    description: "Web3GPT API Reference",
  },
  authentication: {
    http: {
      bearer: {
        token: isProduction ? undefined : UNKEY_CONTRACTS_API_KEY,
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
