import { track } from "@vercel/analytics/server"
import { http, type Address, type Chain, type Hex, createWalletClient, parseEther } from "viem"
import { privateKeyToAccount } from "viem/accounts"

import { getChainById, getExplorerDetails } from "@/lib/viem-utils"

export interface SendEtherParams {
  chainId: number
  to: string
  amount: string
}

export interface SendEtherResult {
  txHash: string
  explorerUrl: string
}

export default async function sendEther({ chainId, to, amount }: SendEtherParams): Promise<SendEtherResult> {
  const viemChain = getChainById(chainId) as Chain

  const senderPk: Hex = `0x${process.env.DEPLOYER_PRIVATE_KEY}`
  const account = privateKeyToAccount(senderPk)

  const alchemyHttpUrl = viemChain?.rpcUrls?.alchemy?.http[0]
    ? `${viemChain.rpcUrls.alchemy.http[0]}/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
    : undefined

  const walletClient = createWalletClient({
    account,
    chain: viemChain,
    transport: http(alchemyHttpUrl)
  })

  if (!(await walletClient.getAddresses())) {
    const error = new Error(`Wallet for chain ${viemChain.name} not available`)
    console.error(error)
    throw error
  }

  const txHash = await walletClient.sendTransaction({
    account,
    chain: viemChain,
    to: to as Address,
    value: parseEther(amount)
  })

  const { url } = getExplorerDetails(viemChain)

  const explorerUrl = `${url}/tx/${txHash}`

  await track("sent_ether", {
    to,
    amount,
    explorerUrl
  })

  return {
    txHash,
    explorerUrl
  }
}
