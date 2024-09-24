import { create } from "zustand"

import { DEFAULT_GLOBAL_CONFIG } from "@/lib/config"
import type { DeployContractParams, GlobalConfig, LastDeploymentData, VerifyContractParams } from "@/lib/types"

interface GlobalState {
  // configs
  globalConfig: GlobalConfig
  setGlobalConfig: (globalConfig: GlobalConfig) => void

  tokenScriptViewerUrl?: string | null
  setTokenScriptViewerUrl: (tokenScriptViewerUrl: string | null) => void

  completedDeploymentReport: boolean
  setCompletedDeploymentReport: (completed: boolean) => void

  readyForTokenScript: boolean
  setReadyForTokenScript: (ready: boolean) => void

  isDeploying: boolean
  setIsDeploying: (isDeploying: boolean) => void

  // last deployment data
  lastDeploymentData?: LastDeploymentData
  setLastDeploymentData: (lastDeploymentData: LastDeploymentData) => void
}

export const useGlobalStore = create<GlobalState>((set) => ({
  // configs
  globalConfig: DEFAULT_GLOBAL_CONFIG,
  setGlobalConfig: (globalConfig: GlobalConfig) => set({ globalConfig }),

  tokenScriptViewerUrl: undefined,
  setTokenScriptViewerUrl: (tokenScriptViewerUrl: string | null) => set({ tokenScriptViewerUrl }),

  isDeploying: false,
  setIsDeploying: (isDeploying: boolean) => set({ isDeploying }),

  // last deployment data
  lastDeploymentData: undefined,
  setLastDeploymentData: (lastDeploymentData: LastDeploymentData) => set({ lastDeploymentData }),

  completedDeploymentReport: false,
  setCompletedDeploymentReport: (completedDeploymentReport: boolean) => set({ completedDeploymentReport }),

  readyForTokenScript: false,
  setReadyForTokenScript: (readyForTokenScript: boolean) => set({ readyForTokenScript })
}))
