import "@/app/globals.css"
import { Analytics } from "@vercel/analytics/react"
import type { Metadata, Viewport } from "next"
import { JetBrains_Mono as FontMono, Inter as FontSans } from "next/font/google"
import { cookies } from "next/headers"
import { ThemeProvider } from "next-themes"
import type { ReactNode } from "react"
import { auth } from "@/auth"
import { Header } from "@/components/header/header"
import { MiniAppInitializer } from "@/components/miniapp-initializer"
import { Web3Provider } from "@/components/providers/web3-provider"
import { PermanentSidebar } from "@/components/sidebar/permanent-sidebar"
import { SidebarContent } from "@/components/sidebar/sidebar-content"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { APP_URL } from "@/lib/config"
import { cn } from "@/lib/utils"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = FontMono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const STRINGIFIED_MINIAPP = JSON.stringify({
  version: "1",
  imageUrl: `${APP_URL}/opengraph-image.png`,
  button: {
    title: "🚀 Launch Web3GPT",
    action: {
      type: "launch_frame",
      name: "Web3GPT",
      url: APP_URL,
      splashImageUrl: `${APP_URL}/assets/web3gpt.png`,
      splashBackgroundColor: "#262626",
    },
  },
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
    icon: "/assets/web3gpt.png",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  metadataBase: new URL(APP_URL),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_URL,
    title: "Web3GPT",
    description: "Deploy smart contracts, create AI Agents, do more onchain with AI.",
    siteName: "Web3GPT",
    images: [
      {
        url: `${APP_URL}/opengraph-image.png`,
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
    creator: "@soko_eth",
    images: [`${APP_URL}/twitter-image.png`],
  },
  other: {
    "fc:miniapp": STRINGIFIED_MINIAPP,
    "fc:frame": STRINGIFIED_MINIAPP,
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
}

export default async function Layout({ children }: { children: ReactNode }) {
  const [session, cookieStore] = await Promise.all([auth(), cookies()])
  const cookiesValue = cookieStore.get("cookie")?.value

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("font-sans antialiased", fontSans.variable, fontMono.variable)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableColorScheme
          enableSystem
          storageKey="preffered-theme"
        >
          <TooltipProvider>
            <Web3Provider cookiesValue={cookiesValue}>
              <MiniAppInitializer />
              <div className="flex h-screen overflow-hidden">
                <PermanentSidebar user={session?.user}>
                  <SidebarContent />
                </PermanentSidebar>
                <div className="flex min-w-0 flex-1 flex-col">
                  <Header />
                  <main className="flex-1 overflow-auto bg-muted/50">{children}</main>
                </div>
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
