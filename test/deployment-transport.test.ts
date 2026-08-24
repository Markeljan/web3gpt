import { describe, expect, test } from "bun:test"
import { polygon, polygonAmoy } from "viem/chains"
import { POLYGON_AMOY_PUBLIC_RPC_URL, POLYGON_MAINNET_PUBLIC_RPC_URL } from "@/lib/constants"
import { getDeploymentRpcUrls } from "@/lib/solidity/deployment-transport"

describe("Polygon deployment RPCs", () => {
  test("uses the documented public Polygon mainnet RPC", () => {
    expect(getDeploymentRpcUrls(polygon)).toContain(POLYGON_MAINNET_PUBLIC_RPC_URL)
  })

  test("uses the documented public Polygon Amoy RPC", () => {
    expect(getDeploymentRpcUrls(polygonAmoy)).toContain(POLYGON_AMOY_PUBLIC_RPC_URL)
  })

  test("prefers a configured provider while preserving the public fallback", () => {
    expect(getDeploymentRpcUrls(polygonAmoy, "https://polygon-amoy.example.com")).toEqual([
      "https://polygon-amoy.example.com",
      POLYGON_AMOY_PUBLIC_RPC_URL,
    ])
  })
})
