import type { Metadata, Viewport } from "next"
import { JetBrains_Mono as FontMono, Inter as FontSans } from "next/font/google"
import { headers } from "next/headers"
import Script from "next/script"
import type { ReactNode } from "react"

import { Analytics } from "@vercel/analytics/react"
import { ThemeProvider } from "next-themes"
import { cookieToInitialState } from "wagmi"

import "@/app/globals.css"
import { Header } from "@/components/header/header"
import { Web3Provider } from "@/components/providers/web3-provider"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { DEPLOYMENT_URL, getWagmiConfig } from "@/lib/config"
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
  description: "Deploy smart contracts, create AI Agents, do more onchain with AI.",
  keywords: ["smart contracts", "AI", "web3", "blockchain", "ethereum", "solidity", "development"],
  authors: [{ name: "Markeljan" }],
  creator: "Markeljan",
  publisher: "W3GPT",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: "/logo.svg",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  metadataBase: new URL(DEPLOYMENT_URL),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: DEPLOYMENT_URL,
    title: "Web3GPT",
    description: "Deploy smart contracts, create AI Agents, do more onchain with AI.",
    siteName: "Web3GPT",
    images: [
      {
        url: `${DEPLOYMENT_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Web3GPT",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Web3GPT",
    description: "Deploy smart contracts, create AI Agents, do more onchain with AI.",
    site: "@w3gptai",
    creator: "@0xSoko",
    images: [`${DEPLOYMENT_URL}/twitter-image.png`],
  },
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
        <Script
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="AmJJJnKB1tQpYEHULJiG1A"
          defer
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
