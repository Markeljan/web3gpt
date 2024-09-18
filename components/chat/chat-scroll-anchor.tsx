"use client"

import { useEffect } from "react"

import { useInView } from "react-intersection-observer"

import { useScrollToBottom } from "@/lib/hooks/use-scroll-to-bottom"

interface ChatScrollAnchorProps {
  trackVisibility?: boolean
}

export function ChatScrollAnchor({ trackVisibility }: ChatScrollAnchorProps) {
  const { isAtBottom } = useScrollToBottom()
  const { ref, entry, inView } = useInView({
    trackVisibility,
    delay: 100,
    rootMargin: "0px 0px -150px 0px"
  })

  useEffect(() => {
    if (isAtBottom && trackVisibility && !inView) {
      entry?.target.scrollIntoView({
        block: "start"
      })
    }
  }, [inView, entry, isAtBottom, trackVisibility])

  return <div ref={ref} className="h-px w-full" />
}
