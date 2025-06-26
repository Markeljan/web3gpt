import { cn } from "@/lib/utils"
import Link from "next/link"

interface LogoProps {
  className?: string
  variant?: "default" | "mobile" | "large" | "xl"
}

type LogoTextProps = LogoProps & {
  children: React.ReactNode
}

// custom text with logo font not link
export const CustomLogoText = ({ className, variant = "default", children }: LogoTextProps) => {
  return (
    <span
      className={cn(
        "font-normal text-sm tracking-tight text-gray-600 dark:text-gray-400",
        variant === "mobile" && "text-base",
        variant === "large" && "text-xl",
        variant === "xl" && "text-2xl",
        className,
      )}
    >
      {children}
    </span>
  )
}

export function W3GPTLogo({ className, variant = "default" }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-2 font-bold text-lg tracking-tight hover:opacity-80 transition-opacity",
        variant === "mobile" && "text-xl",
        variant === "large" && "text-2xl",
        variant === "xl" && "text-3xl",
        className,
      )}
    >
      <span className="text-foreground">
        Web3<span className="text-primary">GPT</span>
      </span>
    </Link>
  )
}
