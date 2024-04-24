"use client"

import { type ReactNode, createContext, useContext, useEffect, useState } from "react"

export const IsClientContext = createContext(false)

export const IsClientContextProvider = ({ children }: { children: ReactNode }) => {
  const [isClient, setIsClient] = useState(false)
  useEffect(() => setIsClient(true), [])

  return <IsClientContext.Provider value={isClient}>{children}</IsClientContext.Provider>
}

export const useIsClient = () => {
  return useContext(IsClientContext)
}
