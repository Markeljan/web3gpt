import { describe, expect, test } from "bun:test"

import { formatDeploymentToolResult } from "@/lib/solidity/deployment-tool-result"

describe("formatDeploymentToolResult", () => {
  test("includes the exact transaction and contract evidence for the agent", () => {
    const result = formatDeploymentToolResult({
      chainId: 80_002,
      contractAddress: "0xba0a7d6e0310807935c85ea4e0ba07a529d166c8",
      explorerUrl: "https://amoy.polygonscan.com/address/0xba0a7d6e0310807935c85ea4e0ba07a529d166c8",
      ipfsUrl: "https://ipfs.io/ipfs/example",
      transactionExplorerUrl:
        "https://amoy.polygonscan.com/tx/0xe585c158836fbbd167f0147aec1544cffe8b6ec868bf24ac9eeda0622192ef79",
      transactionHash: "0xe585c158836fbbd167f0147aec1544cffe8b6ec868bf24ac9eeda0622192ef79",
    })

    expect(result).toContain("chain ID 80002")
    expect(result).toContain("Contract address: 0xba0a7d6e0310807935c85ea4e0ba07a529d166c8.")
    expect(result).toContain("Transaction hash: 0xe585c158836fbbd167f0147aec1544cffe8b6ec868bf24ac9eeda0622192ef79.")
    expect(result).toContain(
      "Transaction explorer URL: https://amoy.polygonscan.com/tx/0xe585c158836fbbd167f0147aec1544cffe8b6ec868bf24ac9eeda0622192ef79."
    )
  })
})
