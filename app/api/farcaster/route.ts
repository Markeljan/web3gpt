import { NextResponse } from "next/server"
import { DEPLOYMENT_URL } from "@/lib/config"

const DYNAMIC_URL = process.env.NODE_ENV === "production" ? DEPLOYMENT_URL : "https://markeljan.a.pinggy.link"

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
    accountAssociation: {
      header:
        "eyJmaWQiOjI4MTI2MCwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDJiOTY1MGNBZTRDNUU2OTQ4RWNBRDYxQjNEYUI2YTk5OTc4NzFlOEQifQ",
      payload: "eyJkb21haW4iOiJtYXJrZWxqYW4uYS5waW5nZ3kubGluayJ9",
      signature:
        "MHhhYzg1NDFiMWI3ZDM4OGY3OWU5NzA5MzY3MGIzNTAxYzUyZDVkYWVjMTIyYmYzNDYyMzU1ZmE2ODM2N2Q2YTgwMTVlNmI5ZmRiOGFjYmNmMDNiMmRjYmQyYzE1ZDE0ODc5MDc4MTA5YzAwYTg2OGJiOTBlZjhmZWNiODE5YmM3ZTFj",
    },
  }

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=86400",
    },
  })
}
