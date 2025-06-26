import type { Agent } from "@/lib/types"

export const DEFAULT_AGENT_ID = "asst_Tgzrzv0VaSgTRMn8ufAULlZG"
export const TOKENSCRIPT_AGENT_ID = "asst_13kX3wWTUa7Gz9jvFOqnnA77"

export const DEFAULT_AGENT: Agent = {
  id: DEFAULT_AGENT_ID,
  userId: "12901349",
  name: "Web3GPT",
  description: "Develop smart contracts",
  creator: "soko.eth",
  imageUrl: "/assets/web3gpt.png",
}

export const AGENTS_ARRAY: Agent[] = [
  DEFAULT_AGENT,
  {
    id: "asst_mv5KGoBLhXXQFiJHpgnopGQQ",
    userId: "12901349",
    name: "Unstoppable Domains",
    description: "Resolve cryptocurrency addresses to domains and vice versa",
    creator: "soko.eth",
    imageUrl: "https://docs.unstoppabledomains.com/images/logo.png",
  },
  {
    name: "OpenZeppelin 5.0",
    userId: "12901349",
    creator: "soko.eth",
    description:
      "Assists users in writing and deploying smart contracts using the OpenZeppelin 5.0 libraries, incorporating the latest features and best practices.",
    id: "asst_s66Y7GSbtkCLHMWKylSjqO7g",
    imageUrl: "https://www.openzeppelin.com/hubfs/oz-iso.svg",
  },
  {
    name: "CTF Agent",
    userId: "12901349",
    creator: "soko.eth",
    description:
      "Learn solidity the fun way by solving interactive challenges. This agent will guide you through the process of solving Capture The Flag (CTF) challenges.",
    id: "asst_GfjkcVcwAXzkNE1JBXNfe89q",
    imageUrl:
      "https://media.licdn.com/dms/image/D5612AQEMTmdASEpqog/article-cover_image-shrink_720_1280/0/1680103178404?e=2147483647&v=beta&t=J6hdKmr-VKTqTyLzO2FR10_mJTdAxzU4QWTQiRrv2fs",
  },
  {
    id: "asst_q1i7mHlBuAbDSrpDQk9f3Egm",
    userId: "12901349",
    name: "Creator",
    description: "Create your own AI agent",
    creator: "soko.eth",
    imageUrl: "/assets/agent-factory.png",
  },
  {
    id: TOKENSCRIPT_AGENT_ID,
    userId: "12689544",
    name: "Smart Token",
    description: "Create a Smart Token - create and self deploy a token, then power it with a TokenScript",
    creator: "61cygni.eth",
    imageUrl: "/assets/tokenscript.png",
  },
]

export const IPFS_W3GPT_GROUP_ID = "ded75ff6-65b1-43a2-bf95-6adc538828f9"
