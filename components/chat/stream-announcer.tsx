"use client"

import type { ChatStatus } from "ai"
import { useEffect, useRef, useState } from "react"

/**
 * Announces only the end of a response.
 *
 * Streaming text is deliberately not inside a live region: announcing every
 * token makes a screen reader unusable. But without this, a response is a
 * stretch of silence with no cue that it finished.
 */
export function StreamAnnouncer({ status }: { status: ChatStatus }) {
  const previousStatus = useRef<ChatStatus>(status)
  const [message, setMessage] = useState("")

  useEffect(() => {
    const wasGenerating = previousStatus.current === "streaming" || previousStatus.current === "submitted"
    previousStatus.current = status

    if (!wasGenerating) {
      return
    }

    if (status === "ready") {
      setMessage("Response complete")
    } else if (status === "error") {
      setMessage("Response failed")
    }
  }, [status])

  return (
    <p aria-live="polite" className="sr-only" role="status">
      {message}
    </p>
  )
}
