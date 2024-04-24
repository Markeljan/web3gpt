import { holesky } from "viem/chains"
import type { GlobalConfig } from "@/lib/functions/types"

export const DEFAULT_GLOBAL_CONFIG: GlobalConfig = {
  viemChain: holesky,
  compilerVersion: "v0.8.23+commit.f704f362",
  useWallet: false
}
