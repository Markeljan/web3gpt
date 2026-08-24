import { describe, expect, test } from "bun:test"
import { polygon, polygonAmoy } from "viem/chains"
import { AGENT_DEPLOY_CHAINS, RPC_URLS, SUPPORTED_CHAINS } from "@/lib/constants"
import { ETHERSCAN_V2_URLS } from "@/lib/etherscan"

describe("Polygon chain support", () => {
  test("allows agent deployments on Polygon mainnet and Amoy", () => {
    expect(AGENT_DEPLOY_CHAINS.some((chain) => chain.id === polygon.id)).toBeTrue()
    expect(AGENT_DEPLOY_CHAINS.some((chain) => chain.id === polygonAmoy.id)).toBeTrue()
  })

  test("keeps Polygon mainnet out of wallet connectors", () => {
    expect(SUPPORTED_CHAINS.some((chain) => chain.id === polygon.id)).toBeFalse()
    expect(SUPPORTED_CHAINS.some((chain) => chain.id === polygonAmoy.id)).toBeTrue()
  })

  test("configures RPC and explorer support for both Polygon networks", () => {
    expect(RPC_URLS[polygon.id]).toBe("https://polygon.drpc.org")
    expect(RPC_URLS[polygonAmoy.id]).toBe("https://polygon-amoy.drpc.org")
    expect(ETHERSCAN_V2_URLS[polygon.id]?.explorerUrl).toBe("https://polygonscan.com")
    expect(ETHERSCAN_V2_URLS[polygonAmoy.id]?.explorerUrl).toBe("https://amoy.polygonscan.com/")
  })
})
