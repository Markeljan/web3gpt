"use client"

import { createContext, useEffect, useState } from "react"

export const IsClientContext = createContext(false)

export const useIsClient = () => {
  const [isClient, setIsClient] = useState(false)
  useEffect(() => setIsClient(true), [])

  return isClient
}
