import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: "#000000",
    description: "Deploy smart contracts, create AI Agents, do more onchain with AI.",
    display: "standalone",
    icons: [
      {
        sizes: "any",
        src: "/assets/web3gpt.png",
        type: "image/x-icon",
      },
    ],
    name: "Web3GPT",
    short_name: "Web3GPT",
    start_url: "/",
    theme_color: "#22DA00",
  }
}
