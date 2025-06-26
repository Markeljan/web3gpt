import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Web3GPT",
    short_name: "Web3GPT",
    description: "Deploy smart contracts, create AI Agents, do more onchain with AI.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#22DA00",
    icons: [
      {
        src: "/assets/web3gpt.png",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  }
}
