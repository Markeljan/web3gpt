# AGENTS.md

## Overview

Web3GPT is a single-app Next.js 16 project for AI-assisted smart contract development. The app combines:

- App Router pages and API routes
- AI SDK chat/completions flows backed by OpenAI models
- GitHub authentication via NextAuth v5 beta
- Wallet connectivity through Wagmi and RainbowKit
- Contract compilation/deployment helpers built on `solc` and `viem`
- Persistence in Vercel KV for users, chats, agents, deployments, and verification jobs

Primary product flows:

- Chat with built-in or user-created agents
- Deploy Solidity contracts to supported EVM testnets
- Persist chats for signed-in users and share published chats
- Run a Vercel cron to process contract verifications

## Stack

- Runtime/package manager: Bun (`bun.lock` is committed)
- Framework: Next.js 16 App Router
- Language: TypeScript with strict mode
- UI: React 19, Tailwind CSS, Radix UI, shadcn/ui-style primitives
- AI: Vercel AI SDK (`ai`, `@ai-sdk/react`, `@ai-sdk/openai`)
- Auth: `next-auth` with GitHub provider
- Web3: `wagmi`, `viem`, `@rainbow-me/rainbowkit`
- Storage/services: `@vercel/kv`, Vercel Analytics, Pinata, Unkey
- Lint/format: Ultracite/Biome

## Common Commands

- Install: `bun install`
- Dev server: `bun dev`
- Build: `bun run build`
- Start production server: `bun run start`
- Typecheck: `bun run typecheck`
- Lint: `bun run lint`
- Format: `bun run format`

Git hooks are managed by `lefthook.yml`. Pre-commit runs `bunx ultracite fix` on JS/TS/JSON/CSS files.

## Environment

Copy from `.env.example`. Important groups:

- RPC and explorer access: `NEXT_PUBLIC_ALCHEMY_API_KEY`, `NEXT_PUBLIC_TENDERLY_API_KEY`, `NEXT_PUBLIC_BLOCKSCOUT_API_KEY`, `NEXT_PUBLIC_ETHERSCAN_API_KEY`
- Wallet connectivity: `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- Auth: `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `AUTH_SECRET`, `AUTH_REDIRECT_PROXY_URL`
- AI providers: `OPENAI_API_KEY`, optional `XAI_API_KEY`, `STABILITY_API_KEY`
- Persistence: `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `KV_REST_API_READ_ONLY_TOKEN`, `KV_URL`
- Deployment/signing: `DEPLOYER_PRIVATE_KEY`
- API protection: `UNKEY_ROOT_KEY`
- Cron auth: `CRON_SECRET`
- IPFS uploads: `PINATA_API_KEY`, `PINATA_API_SECRET`, `PINATA_JWT`

Notes:

- `lib/solidity/deploy.ts` assumes `DEPLOYER_PRIVATE_KEY` is present at module load.
- The v1 API routes throw during initialization if `UNKEY_ROOT_KEY` is missing.
- `vercel.json` schedules `/api/cron` every minute and expects `Authorization: Bearer <CRON_SECRET>`.

## Project Map

- `app/`
  - `app/page.tsx`: landing chat entry, chooses agent from `?a=...`
  - `app/chat/[id]/page.tsx`: authenticated saved-chat route, also supports legacy `thread_*` OpenAI thread IDs
  - `app/share/[id]/page.tsx`: public published-chat view
  - `app/contracts/page.tsx`: deployments dashboard
  - `app/api/chat/route.ts`: main streaming chat endpoint with tool calling
  - `app/api/v1/completions/route.ts`: Unkey-protected text completions API
  - `app/api/v1/contracts/deploy/route.ts`: Unkey-protected generate/compile/deploy API
  - `app/api/cron/route.ts`: verification processor for Vercel Cron
- `components/`
  - `components/chat/*`: chat shell, list, composer, actions
  - `components/header/*` and `components/sidebar/*`: persistent app chrome
  - `components/providers/web3-provider.tsx`: Wagmi, RainbowKit, React Query setup
  - `components/ui/*`: shared UI primitives; most are shadcn-style wrappers
- `lib/`
  - `lib/constants.ts`: built-in agents, supported chains, RPC URLs
  - `lib/config.ts`: Wagmi config and chain/explorer helpers
  - `lib/tools.ts`: AI tool definitions exposed to agents
  - `lib/data/kv.ts`: KV persistence and auth-scoped data access
  - `lib/data/openai.ts`: agent lookup and legacy assistant/thread helpers
  - `lib/solidity/*`: compile, deploy, verification helpers
  - `lib/actions/*`: server-side actions for chat, deploy, domain resolution, verification
- `public/openapi.json`: API schema for docs/reference
- `proxy.ts`: Next.js 16 auth proxy export

## Architecture Notes

- Built-in agents live in `lib/constants.ts`; user-created agents are stored in KV.
- `app/api/chat/route.ts` builds a system prompt from the selected agent and attaches tools from `lib/tools.ts`.
- Chat history is persisted only when a user is signed in and a `chatId` is present.
- Contract deployment flow compiles Solidity, deploys with a server-side private key, uploads artifacts to IPFS, stores verification metadata, and later verifies via cron.
- Supported chains are testnets defined in `lib/constants.ts`; update chain metadata and RPC URLs together.
- Legacy OpenAI thread support still exists in `app/chat/[id]/page.tsx` and `lib/data/openai.ts`.

## Working Conventions

- Prefer Bun for local commands.
- Keep imports using the `@/` alias.
- Follow existing semicolon-free formatting and Biome/Ultracite rules.
- Avoid changing `components/ui/*` unless the shared primitive itself needs to change.
- Keep client/server boundaries explicit. Files under `lib/data/*` and `lib/solidity/*` are server-oriented; interactive chat and wallet code live in client components/hooks.
- When editing deployment logic, trace both the user-facing chat tool path and the public API route path.
- There are currently no automated test files in the repo; rely on targeted manual verification plus `bun run typecheck` and `bun run lint`.

## Safe Edit Checklist

- For chat behavior, inspect both `components/chat/*` and `app/api/chat/route.ts`.
- For auth-sensitive changes, review `auth.ts`, `proxy.ts`, and any `auth()` call sites.
- For chain/deployment changes, review `lib/constants.ts`, `lib/config.ts`, `lib/solidity/deploy.ts`, and verification helpers together.
- For data model changes in chats/agents/deployments, audit `lib/types.ts` and `lib/data/kv.ts` before editing route or UI code.
- For API changes, update `public/openapi.json` if the external contract changes.

## Validation

Minimum validation after non-trivial code changes:

- `bun run typecheck`
- `bun run lint`

For UI or route changes, also run the app with `bun dev` and verify the affected flow in the browser.
