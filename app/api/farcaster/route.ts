import { NextResponse } from "next/server"
import { DEPLOYMENT_URL } from "@/lib/config"

const DYNAMIC_URL = process.env.NODE_ENV === "production" ? DEPLOYMENT_URL : "https://markeljan.a.pinggy.link"

const DYNAMIC_ACCOUNT_ASSOCIATION =
  process.env.NODE_ENV === "production"
    ? {
        header:
          "eyJmaWQiOjI4MTI2MCwidHlwZSI6ImF1dGgiLCJrZXkiOiIweDNiN0M0NzU1ZTFBNzdDMjBBRDI4N2I4Q2RGMDRkOTdiOTY3YjA3NEYifQ",
        payload: "eyJkb21haW4iOiJ3M2dwdC5haSJ9",
        signature: "yNtnGwqI5Z4QbFM3zGPIct7c8X7w3Uz9AfkZwrOFps0P+zm2Fq8ecGj0qWC8nty7UzCBOmQ4soEa/bHifAA5VRs=",
      }
    : {
        header:
          "eyJmaWQiOjI4MTI2MCwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDJiOTY1MGNBZTRDNUU2OTQ4RWNBRDYxQjNEYUI2YTk5OTc4NzFlOEQifQ",
        payload: "eyJkb21haW4iOiJtYXJrZWxqYW4uYS5waW5nZ3kubGluayJ9",
        signature:
          "MHhhYzg1NDFiMWI3ZDM4OGY3OWU5NzA5MzY3MGIzNTAxYzUyZDVkYWVjMTIyYmYzNDYyMzU1ZmE2ODM2N2Q2YTgwMTVlNmI5ZmRiOGFjYmNmMDNiMmRjYmQyYzE1ZDE0ODc5MDc4MTA5YzAwYTg2OGJiOTBlZjhmZWNiODE5YmM3ZTFj",
      }
export async function GET() {
  const manifest = {
    miniapp: {
      version: "1",
      name: "Web3GPT",
      homeUrl: DYNAMIC_URL,
      iconUrl: `${DYNAMIC_URL}/assets/web3gpt.png`,
      splashImageUrl: `${DYNAMIC_URL}/assets/web3gpt.png`,
      splashBackgroundColor: "#262626",
      subtitle: "Deploy contracts with AI",
      description:
        "Deploy smart contracts, create AI Agents, do more onchain with AI. Build and interact with the blockchain using natural language.",
      screenshotUrls: [`${DYNAMIC_URL}/opengraph-image.png`],
      primaryCategory: "developer-tools",
      tags: ["smart-contracts", "ai", "blockchain", "ethereum", "developer"],
      heroImageUrl: `${DYNAMIC_URL}/opengraph-image.png`,
      tagline: "Build onchain with AI",
      ogTitle: "Web3GPT",
      ogDescription: "Deploy smart contracts, create AI Agents, do more onchain with AI.",
      ogImageUrl: `${DYNAMIC_URL}/opengraph-image.png`,
      noindex: false,
      canonicalDomain: new URL(DYNAMIC_URL).hostname,
    },
    accountAssociation: DYNAMIC_ACCOUNT_ASSOCIATION,
  }

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=86400",
    },
  })
}
