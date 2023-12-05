import { DEFAULT_GLOBAL_CONFIG } from '@/lib/constants'
import {
  ContractDeploymentData,
  DeployContractParams,
  GlobalConfig
} from '@/lib/functions/types'
import { create } from 'zustand'

interface GlobalState {
  // configs
  globalConfig: GlobalConfig
  setGlobalConfig: (globalConfig: GlobalConfig) => void

  deployContractConfig?: Partial<DeployContractParams>
  setDeployContractConfig: (
    deployContractConfig: Partial<DeployContractParams>
  ) => void

  // loading states
  isLoading: boolean
  setIsLoading: (isLoading: boolean) => void
  isGenerating: boolean
  setIsGenerating: (isGenerating: boolean) => void
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
  setDeployContractConfig: (
    deployContractConfig: Partial<DeployContractParams>
  ) => set({ deployContractConfig }),

  // loading states
  isLoading: false,
  setIsLoading: (isLoading: boolean) => set({ isLoading }),
  isGenerating: false,
  setIsGenerating: (isGenerating: boolean) => set({ isGenerating }),
  isDeploying: false,
  setIsDeploying: (isDeploying: boolean) => set({ isDeploying }),
  isVerifying: false,
  setIsVerifying: (isVerifying: boolean) => set({ isVerifying })
}))
