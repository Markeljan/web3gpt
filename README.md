# Web3GPT

Web3GPT is an AI-powered smart contract platform for chatting with onchain agents, deploying Solidity contracts, and running agent-driven workflows on EVM chains.

The current public integration surface is agent-first:

- browser chat UI at [w3gpt.ai](https://w3gpt.ai)
- skill endpoint at `https://w3gpt.ai/api/skill`
- skill guide at `https://w3gpt.ai/skill.md`
- API reference at `https://w3gpt.ai/api-docs`

## What Changed

- the old Unkey-backed `/api/v1` endpoints are removed
- the SDK now targets the skill/chat flow instead of separate completions/deploy APIs
- Polygon mainnet deployment is available through the agent and skill endpoint
- Polygon mainnet is not exposed through wallet connectors in the UI

## Core Flows

- chat with built-in or user-created Web3GPT agents
- deploy contracts through the agent conversation
- persist authenticated browser chats in Vercel KV
- persist anonymous skill chats by `chatId`
- verify deployments through the Vercel cron job

## Supported Agent Deployment Chains

- Polygon Mainnet
- Polygon Amoy
- Base Sepolia
- Arbitrum Sepolia
- Optimism Sepolia
- Mantle Sepolia
- Metis Sepolia
- Celo Alfajores
- Ethereum Sepolia

## Getting Started

1. Clone the repository.
2. Copy `.env.example` and fill in the required variables.
3. Install dependencies.
4. Run the app.

```bash
bun install
bun dev
```

## Important Environment Variables

- `OPENAI_API_KEY`
- `DEPLOYER_PRIVATE_KEY`
- `AUTH_GITHUB_ID`
- `AUTH_GITHUB_SECRET`
- `AUTH_SECRET`
- `CRON_SECRET`
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `NEXT_PUBLIC_ALCHEMY_API_KEY`
- `NEXT_PUBLIC_TENDERLY_API_KEY`
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- `PINATA_JWT`

## Skill API

Start a chat:

```bash
curl https://w3gpt.ai/api/skill
```

Continue a chat:

```bash
curl -X POST "https://w3gpt.ai/api/skill?chatId=your-chat-id" \
  -H "Content-Type: application/json" \
  -d '{"message":"Deploy an ERC20 on Polygon mainnet"}'
```

Include full history:

```bash
curl "https://w3gpt.ai/api/skill?chatId=your-chat-id&history=true"
```

The `chatId` is the secret for continuing a thread outside the browser UI.

## Development Commands

- `bun dev`
- `bun run build`
- `bun run start`
- `bun run typecheck`
- `bun run lint`
- `bun run format`
