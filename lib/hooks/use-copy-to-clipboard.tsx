import { useState } from "react"

import { useIsClient } from "@/lib/hooks/use-is-client"

export type useCopyToClipboardProps = {
  timeout?: number
}

export function useCopyToClipboard({ timeout = 2000 }: useCopyToClipboardProps) {
  const [isCopied, setIsCopied] = useState<boolean>(false)
  const isClient = useIsClient()

  const copyToClipboard = (value: string) => {
    if (!isClient) {
      return
    }
    navigator.clipboard.writeText(value).then(() => {
      setIsCopied(true)

      setTimeout(() => {
        setIsCopied(false)
      }, timeout)
    })
  }

  return { isCopied, copyToClipboard }
}
