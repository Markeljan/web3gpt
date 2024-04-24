import { cn } from "@/lib/utils"
import { ExternalLink } from "@/components/external-link"

export function FooterText({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p className={cn("px-2 text-center text-xs leading-normal text-muted-foreground", className)} {...props}>
      Made by <ExternalLink href="https://twitter.com/0xmarkeljan">Markeljan</ExternalLink> with{" "}
      <ExternalLink href="https://github.com/vercel-labs/ai">Vercel AI</ExternalLink>.
    </p>
  )
}
