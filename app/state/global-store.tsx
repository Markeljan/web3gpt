import { create } from "zustand"

import { DEFAULT_GLOBAL_CONFIG } from "@/lib/config"
import type { DeployContractParams, GlobalConfig, LastDeploymentData, VerifyContractParams } from "@/lib/types"

interface GlobalState {
  // configs
  globalConfig: GlobalConfig
  setGlobalConfig: (globalConfig: GlobalConfig) => void

  verifyContractConfig?: Partial<VerifyContractParams>
  setVerifyContractConfig: (verifyContractConfig: Partial<VerifyContractParams>) => void

  deployContractConfig?: Partial<DeployContractParams>
  setDeployContractConfig: (deployContractConfig: Partial<DeployContractParams>) => void

  tokenScriptViewerUrl?: string | null
  setTokenScriptViewerUrl: (tokenScriptViewerUrl: string | null) => void

  completedDeploymentReport: boolean
  setCompletedDeploymentReport: (completed: boolean) => void

  readyForTokenScript: boolean
  setReadyForTokenScript: (ready: boolean) => void

  // loading states
  isLoading: boolean
  setIsLoading: (isLoading: boolean) => void
  isGenerating: boolean
  setIsGenerating: (isGenerating: boolean) => void
  isDeploying: boolean
  setIsDeploying: (isDeploying: boolean) => void
  isVerifying: boolean
  setIsVerifying: (isPolling: boolean) => void

  // last deployment data
  lastDeploymentData?: LastDeploymentData
  setLastDeploymentData: (lastDeploymentData: LastDeploymentData) => void
}

export const useGlobalStore = create<GlobalState>((set) => ({
  // configs
  globalConfig: DEFAULT_GLOBAL_CONFIG,
  setGlobalConfig: (globalConfig: GlobalConfig) => set({ globalConfig }),
  verifyContractConfig: undefined,
  setVerifyContractConfig: (verifyContractConfig: Partial<VerifyContractParams>) => set({ verifyContractConfig }),

  deployContractConfig: undefined,
  setDeployContractConfig: (deployContractConfig: Partial<DeployContractParams>) => set({ deployContractConfig }),

  tokenScriptViewerUrl: undefined,
  setTokenScriptViewerUrl: (tokenScriptViewerUrl: string | null) => set({ tokenScriptViewerUrl }),

  // loading states
  isLoading: false,
  setIsLoading: (isLoading: boolean) => set({ isLoading }),
  isGenerating: false,
  setIsGenerating: (isGenerating: boolean) => set({ isGenerating }),
  isDeploying: false,
  setIsDeploying: (isDeploying: boolean) => set({ isDeploying }),
  isVerifying: false,
  setIsVerifying: (isVerifying: boolean) => set({ isVerifying }),

  // last deployment data
  lastDeploymentData: undefined,
  setLastDeploymentData: (lastDeploymentData: LastDeploymentData) => set({ lastDeploymentData }),

  completedDeploymentReport: false,
  setCompletedDeploymentReport: (completedDeploymentReport: boolean) => set({ completedDeploymentReport }),

  readyForTokenScript: false,
  setReadyForTokenScript: (readyForTokenScript: boolean) => set({ readyForTokenScript }),
}))
