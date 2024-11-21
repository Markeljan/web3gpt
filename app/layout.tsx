import type { Metadata, Viewport } from "next"
import { JetBrains_Mono as FontMono, Inter as FontSans } from "next/font/google"
import { headers } from "next/headers"
import type { ReactNode } from "react"

import { Analytics } from "@vercel/analytics/react"
import { ThemeProvider } from "next-themes"
import { cookieToInitialState } from "wagmi"

import "@/app/globals.css"
import { Header } from "@/components/header/header"
import { Web3Provider } from "@/components/providers/web3-provider"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { APP_URL, getWagmiConfig } from "@/lib/config"
import { cn } from "@/lib/utils"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = FontMono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: {
    default: "Web3GPT",
    template: "%s - Web3GPT",
  },
  description: "Write and deploy smart contracts with AI.",
  icons: {
    icon: "/logo.svg",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  metadataBase: new URL(APP_URL),
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
}

export default function Layout({ children }: { children: ReactNode }) {
  const initialState = cookieToInitialState(getWagmiConfig(), headers().get("cookie"))

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("font-sans antialiased", fontSans.variable, fontMono.variable)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          enableColorScheme
          storageKey="preffered-theme"
        >
          <TooltipProvider>
            <Web3Provider initialState={initialState}>
              <div className="flex min-h-screen flex-col">
                <main className="flex flex-1 flex-col bg-muted/50">
                  <Header />
                  {children}
                </main>
              </div>
              <Toaster
                toastOptions={{
                  duration: 2000,
                }}
              />
            </Web3Provider>
          </TooltipProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
