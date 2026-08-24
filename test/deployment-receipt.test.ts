import { describe, expect, test } from "bun:test"
import { getDeployedContractAddress } from "@/lib/solidity/deployment-receipt"

describe("deployment receipt confirmation", () => {
  test("returns the mined contract address for a successful creation", () => {
    expect(
      getDeployedContractAddress(
        {
          contractAddress: "0x1370",
          status: "success",
          transactionHash: "0x1371",
        },
        "Polygon"
      )
    ).toBe("0x1370")
  })

  test("rejects reverted transactions", () => {
    expect(() =>
      getDeployedContractAddress(
        {
          contractAddress: null,
          status: "reverted",
          transactionHash: "0x1371",
        },
        "Polygon"
      )
    ).toThrow("reverted on Polygon")
  })

  test("rejects successful non-creation transactions", () => {
    expect(() =>
      getDeployedContractAddress(
        {
          contractAddress: null,
          status: "success",
          transactionHash: "0x1371",
        },
        "Polygon"
      )
    ).toThrow("did not create a contract on Polygon")
  })
})
