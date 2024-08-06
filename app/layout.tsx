import type { Metadata, Viewport } from "next"
import { JetBrains_Mono as FontMono, Inter as FontSans } from "next/font/google"

import { Toaster } from "@/components/ui/sonner"
import { Analytics } from "@vercel/analytics/react"

import "@/app/globals.css"
import { Header } from "@/components/header/header"
import { Providers } from "@/components/providers/ui-providers"
import { Web3Provider } from "@/components/providers/web3-provider"
import { APP_URL } from "@/lib/config"
import { cn } from "@/lib/utils"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans"
})

const fontMono = FontMono({
  subsets: ["latin"],
  variable: "--font-mono"
})

export const metadata: Metadata = {
  title: {
    default: "Web3GPT",
    template: "%s - Web3GPT"
  },
  description: "Write and deploy smart contracts with AI.",
  icons: {
    icon: "/logo.svg",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png"
  },
  metadataBase: new URL(APP_URL)
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
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("font-sans antialiased", fontSans.variable, fontMono.variable)}>
        <Providers attribute="class" defaultTheme="system" enableSystem>
          <div className="flex min-h-screen flex-col">
            <main className="flex flex-1 flex-col bg-muted/50">
              <Web3Provider>
                <Header />
                {children}
                <Toaster />
              </Web3Provider>
            </main>
          </div>
          <Analytics />
        </Providers>
      </body>
    </html>
  )
}
