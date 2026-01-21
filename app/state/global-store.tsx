import { create } from "zustand"
import type { LastDeploymentData } from "@/lib/types"

type GlobalState = {
  isDeploying: boolean
  setIsDeploying: (isDeploying: boolean) => void

  // last deployment data
  lastDeploymentData?: LastDeploymentData
  setLastDeploymentData: (lastDeploymentData: LastDeploymentData) => void
}

export const useGlobalStore = create<GlobalState>((set) => ({
  isDeploying: false,
  setIsDeploying: (isDeploying: boolean) => set({ isDeploying }),

  // last deployment data
  lastDeploymentData: undefined,
  setLastDeploymentData: (lastDeploymentData: LastDeploymentData) => set({ lastDeploymentData }),
}))
