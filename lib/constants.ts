import { holesky } from "viem/chains"
import type { GlobalConfig } from "@/lib/functions/types"

export const DEFAULT_GLOBAL_CONFIG: GlobalConfig = {
  viemChain: holesky,
  compilerVersion: "v0.8.25+commit.b61c2a91",
  useWallet: false
}
