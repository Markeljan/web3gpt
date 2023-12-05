import { Chain } from 'viem'
import * as allViemChains from 'viem/chains'

const { ...chains } = allViemChains

export function getChainById(chainId: number) {
  for (const chain of Object.values(chains)) {
    if (chain.id === chainId) {
      return chain
    }
  }

  throw new Error(`Chain with id ${chainId} not found`)
}

export const API_URLS: Record<Chain['id'], string> = {
  1: 'https://api.etherscan.io/api',
  5: 'https://api-goerli.etherscan.io/api',
  11155111: 'https://api-sepolia.etherscan.io/api',
  421613: 'https://api-goerli.arbiscan.io/api',
  80001: 'https://api-testnet.polygonscan.com/api',
  420: 'https://api-goerli.optimistic.etherscan.io/api',
  84531: 'https://api-goerli.basescan.org/api'
}

export const API_KEYS: Record<Chain['id'], string> = {
  1: `${process.env.ETHEREUM_EXPLORER_API_KEY}`,
  5: `${process.env.ETHEREUM_EXPLORER_API_KEY}`,
  11155111: `${process.env.ETHEREUM_EXPLORER_API_KEY}`,
  421613: `${process.env.ARBITRUM_EXPLORER_API_KEY}`,
  80001: `${process.env.POLYGON_EXPLORER_API_KEY}`,
  420: `${process.env.OPTIMISM_EXPLORER_API_KEY}`,
  84531: `${process.env.BASE_EXPLORER_API_KEY}`
}

export const getExplorerUrl = (viemChain: Chain): string | undefined => {
  return viemChain?.blockExplorers?.default.url
}
