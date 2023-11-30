import { baseGoerli } from 'viem/chains'
import { GlobalConfig } from './functions/types'

export const DEFAULT_GLOBAL_CONFIG: GlobalConfig = {
  viemChain: baseGoerli,
  solidityVersion: '0.8.22',
  evmVersion: 'shanghai',
  useWallet: false
}
