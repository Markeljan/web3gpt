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
    name: "Chat",
    href: "/",
    icon: MessagesSquare,
  },
  {
    name: "Contracts",
    href: "/contracts",
    icon: Code,
    badge: "New",
  },
  {
    name: "Docs",
    href: "https://docs.w3gpt.ai",
    icon: BookText,
    external: true,
  },
]
