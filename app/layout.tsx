import type { Metadata, Viewport } from "next"

import { Analytics } from "@vercel/analytics/react"
import { Toaster } from "react-hot-toast"
import { SessionProvider } from "next-auth/react"

import "@/app/globals.css"
import { auth } from "@/auth"
import Header from "@/components/header"
import { Providers } from "@/components/providers/ui-providers"
import { Web3Provider } from "@/components/providers/web3-provider"
import { fontMono, fontSans } from "@/lib/fonts"
import { cn } from "@/lib/utils"

export const runtime = "edge"

export const metadata: Metadata = {
  metadataBase: new URL("https://w3gpt.ai"),
  title: {
    default: "Web3 GPT",
    template: "Web3 GPT"
  },
  description: "Write and deploy smart contracts with AI.",
  icons: {
    icon: "/favicon.png"
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" }
  ]
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const session = await auth()
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={cn("font-sans antialiased", fontSans.variable, fontMono.variable)}>
        <Toaster />
        <Providers attribute="class" defaultTheme="system" enableSystem>
          <div className="flex min-h-screen flex-col">
            <main className="flex flex-1 flex-col bg-muted/50">
              <Web3Provider>
                <Header />
                <SessionProvider session={session}>{children}</SessionProvider>
              </Web3Provider>
            </main>
          </div>
          <Analytics />
        </Providers>
      </body>
    </html>
  )
}
