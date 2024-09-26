import "server-only"

import { privateKeyToAccount } from "viem/accounts"
import { z } from "zod"

const envSchema = z.object({
  CRON_SECRET: z.string().min(1),
  INFURA_API_KEY: z.string().min(1),
  PINATA_JWT: z.string().min(1),
  AUTH_SECRET: z.string().min(1),
  DEPLOYER_PRIVATE_KEY: z.string().min(1)
})

const env = envSchema.parse({
  CRON_SECRET: process.env.CRON_SECRET,
  INFURA_API_KEY: process.env.INFURA_API_KEY,
  PINATA_JWT: process.env.PINATA_JWT,
  AUTH_SECRET: process.env.AUTH_SECRET,
  DEPLOYER_PRIVATE_KEY: process.env.DEPLOYER_PRIVATE_KEY
})

export const { CRON_SECRET, INFURA_API_KEY, PINATA_JWT, AUTH_SECRET } = env

export const DEPLOYER_ACCOUNT = privateKeyToAccount(`0x${env.DEPLOYER_PRIVATE_KEY}`)
