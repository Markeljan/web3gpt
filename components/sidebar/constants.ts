import { BookText, Code, MessagesSquare } from "lucide-react"

type NavigationItem = {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  external?: boolean
  badge?: string
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    href: "/",
    icon: MessagesSquare,
    name: "Chat",
  },
  {
    href: "/contracts",
    icon: Code,
    name: "Contracts",
  },
  {
    external: true,
    href: "https://docs.w3gpt.ai",
    icon: BookText,
    name: "Docs",
  },
]
