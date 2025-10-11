import { useEffect } from "react"
import { useConnect } from "wagmi"

export const useSafeAutoConnect = () => {
  const { connect, connectors } = useConnect()

  useEffect(() => {
    const safeConnector = connectors.find((c) => c.id === "safe")

    if (safeConnector?.ready) {
      connect({ connector: safeConnector })
    }
  }, [connect, connectors])
}
