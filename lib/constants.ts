import { holesky } from "viem/chains"
import type { GlobalConfig } from "@/lib/functions/types"

export const DEFAULT_GLOBAL_CONFIG: GlobalConfig = {
  viemChain: holesky,
  compilerVersion: "v0.8.25+commit.b61c2a91",
  useWallet: false
}

export const ASSISTANTS = {
  ERC20: "asst_We6a5t8B5F5uCOPMadM92hCT",
  ERC721: "asst_c5RLL0wfNkyBQJ5zLmmpHFDh",
  W3GPT: "asst_Tgzrzv0VaSgTRMn8ufAULlZG"
}
