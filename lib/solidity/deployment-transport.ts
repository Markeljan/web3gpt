import { type Chain, fallback, http, type Transport } from "viem"
import { polygon, polygonAmoy } from "viem/chains"
import { POLYGON_AMOY_PUBLIC_RPC_URL, POLYGON_MAINNET_PUBLIC_RPC_URL, RPC_URLS } from "@/lib/constants"

const publicPolygonRpcUrl = (chainId: number): string | undefined => {
  if (chainId === polygon.id) {
    return POLYGON_MAINNET_PUBLIC_RPC_URL
  }
  if (chainId === polygonAmoy.id) {
    return POLYGON_AMOY_PUBLIC_RPC_URL
  }
}

const configuredPolygonRpcUrl = (chainId: number): string | undefined => {
  if (chainId === polygon.id) {
    return process.env.POLYGON_MAINNET_RPC_URL
  }
  if (chainId === polygonAmoy.id) {
    return process.env.POLYGON_AMOY_RPC_URL
  }
}

export const getDeploymentRpcUrls = (chain: Chain, configuredRpcUrl?: string): string[] => {
  const urls = [
    configuredRpcUrl,
    RPC_URLS[chain.id],
    publicPolygonRpcUrl(chain.id),
    ...chain.rpcUrls.default.http,
  ].filter((url): url is string => Boolean(url))

  return [...new Set(urls)]
}

export const getDeploymentTransport = (chain: Chain): Transport => {
  const configuredRpcUrl = configuredPolygonRpcUrl(chain.id)
  const transports = getDeploymentRpcUrls(chain, configuredRpcUrl).map((rpcUrl) => http(rpcUrl, { retryCount: 1 }))

  if (transports.length === 1) {
    return transports[0]
  }

  return fallback(transports, { rank: false })
}
