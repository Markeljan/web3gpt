// pages/api/check-domain.js
import { INFURA_API_KEY } from "@/app/config"
import { Resolution } from "@unstoppabledomains/resolution"

const resolution = new Resolution({
  sourceConfig: {
    uns: {
      locations: {
        Layer1: {
          url: `https://mainnet.infura.io/v3/${INFURA_API_KEY}`,
          network: "mainnet"
        },
        Layer2: {
          url: `https://polygon-mainnet.infura.io/v3/${INFURA_API_KEY}`,
          network: "polygon-mainnet"
        }
      }
    },
    ens: {
      url: `https://mainnet.infura.io/v3/${INFURA_API_KEY}`,
      network: "mainnet"
    },
    zns: {
      url: "https://api.zilliqa.com",
      network: "mainnet"
    }
  }
})

export const resolveDomain = async (domain: string, ticker = "ETH") => {
  const address = await resolution.addr(domain, ticker)
  return address
}

export const resolveAddress = async (address: string) => {
  const domain = await resolution.reverse(address)
  return domain
}
