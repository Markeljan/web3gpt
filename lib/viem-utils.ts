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

export const API_URLS: Record<Chain['name'], string> = {
  Ethereum: 'https://api.etherscan.io/api',
  Goerli: 'https://api-goerli.etherscan.io/api',
  Sepolia: 'https://api-sepolia.etherscan.io/api',
  'Arbitrum One': 'https://api.arbiscan.io/api',
  'Arbitrum Goerli': 'https://api-goerli.arbiscan.io/api',
  'Polygon Mainnet': 'https://api.polygonscan.com/api',
  Mumbai: 'https://api-testnet.polygonscan.com/api',
  Optimism: 'https://api-optimistic.etherscan.io/api',
  'Optimism Goerli Testnet': 'https://api-goerli.optimistic.etherscan.io/api',
  'Base Goerli Testnet': 'https://api-goerli.basescan.org/api'
}

export const API_KEYS: Record<Chain['name'], string | undefined> = {
  Ethereum: process.env.ETHEREUM_EXPLORER_API_KEY,
  Goerli: process.env.ETHEREUM_EXPLORER_API_KEY,
  Sepolia: process.env.ETHEREUM_EXPLORER_API_KEY,
  'Arbitrum One': process.env.ARBITRUM_EXPLORER_API_KEY,
  'Arbitrum Goerli': process.env.ARBITRUM_EXPLORER_API_KEY,
  'Polygon Mainnet': process.env.POLYGON_EXPLORER_API_KEY,
  Mumbai: process.env.POLYGON_EXPLORER_API_KEY,
  Optimism: process.env.OPTIMISM_EXPLORER_API_KEY,
  'Optimism Goerli Testnet': process.env.OPTIMISM_EXPLORER_API_KEY,
  Base: process.env.BASE_EXPLORER_API_KEY,
  'Base Goerli Testnet': process.env.BASE_EXPLORER_API_KEY
}

export const getExplorerUrl = (viemChain: Chain): string | undefined => {
  return viemChain?.blockExplorers?.default.url
}
