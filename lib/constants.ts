import { mantleTestnet } from 'viem/chains'
import { GlobalConfig } from './functions/types'

export const DEFAULT_GLOBAL_CONFIG: GlobalConfig = {
  viemChain: mantleTestnet,
  compilerVersion: 'v0.8.23+commit.f704f362',
  useWallet: false
}
