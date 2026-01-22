"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"

const ACTIVE_MODEL = "gpt-5-mini"

export function ModelBadge() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <Badge
      className="hidden border-primary/20 bg-primary/10 px-2 py-0.5 font-mono text-[10px] text-primary lg:inline-flex"
      variant="secondary"
    >
      {ACTIVE_MODEL}
    </Badge>
  )
}
