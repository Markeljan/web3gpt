import { defineChain } from "viem"

export const mantleSepolia = /*#__PURE__*/ defineChain({
  id: 5003,
  name: "Mantle Sepolia",
  network: "mantle",
  nativeCurrency: {
    decimals: 18,
    name: "Mantle",
    symbol: "MNT"
  },
  rpcUrls: {
    default: { http: ["https://rpc.sepolia.mantle.xyz"] },
    public: { http: ["https://rpc.sepolia.mantle.xyz"] }
  },
  blockExplorers: {
    etherscan: {
      name: "Mantle Sepolia Explorer",
      url: "https://explorer.sepolia.mantle.xyz"
    },
    default: {
      name: "Mantle Sepolia Explorer",
      url: "https://explorer.sepolia.mantle.xyz"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 4584012
    }
  },
  testnet: true
})
