import { useConnect } from "wagmi"
import { useEffect } from "react"

const AUTOCONNECTED_CONNECTOR_IDS = ["safe"]

export const useSafeAutoConnect = () => {
  const { connect, connectors } = useConnect()

  useEffect(() => {
    for (const connector of AUTOCONNECTED_CONNECTOR_IDS) {
      const connectorInstance = connectors.find((c) => c.id === connector && c.ready)

      if (connectorInstance) {
        connect({ connector: connectorInstance })
      }
    }
  }, [connect, connectors])
}
