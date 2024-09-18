import { type RefObject, useCallback, useEffect, useState } from "react"

export function useScrollToBottom(ref?: RefObject<HTMLElement>, offset = 200) {
  const [isAtBottom, setIsAtBottom] = useState(false)

  const checkIfAtBottom = useCallback(() => {
    const atBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - offset
    setIsAtBottom(atBottom)
  }, [offset])

  const scrollToBottom = useCallback(() => {
    window.scrollTo({
      top: document.body.offsetHeight,
      behavior: "smooth"
    })
  }, [])

  useEffect(() => {
    window.addEventListener("scroll", checkIfAtBottom, { passive: true })
    checkIfAtBottom()
    return () => {
      window.removeEventListener("scroll", checkIfAtBottom)
    }
  }, [checkIfAtBottom])

  useEffect(() => {
    if (ref?.current) {
      ref.current.scrollTop = ref.current.scrollHeight
      scrollToBottom()
    }
  }, [ref, scrollToBottom])

  return { isAtBottom, scrollToBottom }
}
