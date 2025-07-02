import { z } from "zod"

const envSchema = z.object({
  NEXT_PUBLIC_ALCHEMY_API_KEY: z.string(),
  //NEXT_PUBLIC_QUICKNODE_API_KEY: z.string(),
  NEXT_PUBLIC_INFURA_API_KEY: z.string(),
  NEXT_PUBLIC_IPFS_GATEWAY: z.string(),
  NEXT_PUBLIC_BLOCKSCOUT_API_KEY: z.string(),
  NEXT_PUBLIC_ETHERSCAN_API_KEY: z.string(),
  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: z.string(),
  NEXT_PUBLIC_TENDERLY_API_KEY: z.string(),
  CRON_SECRET: z.string().min(1),
  PINATA_JWT: z.string().min(1),
  AUTH_SECRET: z.string().min(1),
  DEPLOYER_PRIVATE_KEY: z.string().min(1),
  UNKEY_COMPLETIONS_API_ID: z.string().min(1),
  UNKEY_CONTRACTS_API_ID: z.string().min(1),
  UNKEY_CONTRACTS_API_KEY: z.string().min(1),
})

envSchema.parse(process.env)

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envSchema> {}
  }
}
