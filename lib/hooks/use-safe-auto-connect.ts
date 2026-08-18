import { useEffect, useRef } from "react"
import { useAccount, useConnect } from "wagmi"

// The Safe connector only resolves a provider inside the Safe App iframe.
// Outside of it `getProvider()` returns undefined and `connect()` throws,
// so mirror the iframe check wagmi and RainbowKit use before connecting.
const isSafeAppFrame = () => typeof window !== "undefined" && window.parent !== window

export const useSafeAutoConnect = () => {
  const { connect, connectors } = useConnect()
  const { isConnected, isConnecting, isReconnecting } = useAccount()
  const attemptedUid = useRef<string>(undefined)

  useEffect(() => {
    if (isConnected || isConnecting || isReconnecting || !isSafeAppFrame()) {
      return
    }

    const safeConnector = connectors.find((c) => c.id === "safe")
    if (!safeConnector || attemptedUid.current === safeConnector.uid) {
      return
    }

    attemptedUid.current = safeConnector.uid
    connect({ connector: safeConnector })
  }, [connect, connectors, isConnected, isConnecting, isReconnecting])
}
