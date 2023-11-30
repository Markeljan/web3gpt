import { DEFAULT_GLOBAL_CONFIG } from '@/lib/constants'
import {
  DeployContractParams,
  GlobalConfig,
  VerifyContractParams
} from '@/lib/functions/types'
import { create } from 'zustand'

interface GlobalState {
  // configs
  globalConfig: GlobalConfig
  setGlobalConfig: (globalConfig: GlobalConfig) => void

  deployContractConfig?: DeployContractParams
  setDeployContractConfig: (deployContractConfig: DeployContractParams) => void

  verifyContractConfig?: VerifyContractParams
  setVerifyContractConfig: (verifyContractConfig: VerifyContractParams) => void

  // loading states
  isLoading: boolean
  setIsLoading: (isLoading: boolean) => void

  isDeploying: boolean
  setIsDeploying: (isDeploying: boolean) => void

  isVerifying: boolean
  setIsVerifying: (isPolling: boolean) => void
}

export const useGlobalStore = create<GlobalState>(set => ({
  // configs
  globalConfig: DEFAULT_GLOBAL_CONFIG,
  setGlobalConfig: (globalConfig: GlobalConfig) => set({ globalConfig }),

  deployContractConfig: undefined,
  setDeployContractConfig: (deployContractConfig: DeployContractParams) =>
    set({ deployContractConfig }),

  verifyContractConfig: undefined,
  setVerifyContractConfig: (verifyContractConfig: VerifyContractParams) =>
    set({ verifyContractConfig }),

  // loading states
  isLoading: false,
  setIsLoading: (isLoading: boolean) => set({ isLoading }),

  isDeploying: false,
  setIsDeploying: (isDeploying: boolean) => set({ isDeploying }),

  isVerifying: false,
  setIsVerifying: (isVerifying: boolean) => set({ isVerifying })
}))
