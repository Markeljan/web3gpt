import { create } from "zustand"

import type { LastDeploymentData } from "@/lib/types"

type GlobalState = {
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
  setReadyForTokenScript: (readyForTokenScript: boolean) => set({ readyForTokenScript }),
}))
