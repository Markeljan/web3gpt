import type { Metadata } from "next"

import { auth } from "@/auth"
import { SignInCard } from "@/components/sign-in/sign-in-card"

export const metadata: Metadata = {
  title: "Sign in",
  description: "Authenticate with GitHub or Sign-In with Ethereum to access Web3GPT.",
}

type SignInPageProps = {
  searchParams?: Record<string, string | string[] | undefined>
}

function resolveRedirect(searchParams: SignInPageProps["searchParams"]) {
  const nextParam = searchParams?.next
  const rawValue = Array.isArray(nextParam) ? nextParam[0] : nextParam
  if (!rawValue) return "/"

  let decoded = rawValue
  try {
    decoded = decodeURIComponent(rawValue)
  } catch {
    decoded = rawValue
  }

  if (!decoded.startsWith("/")) return "/"
  if (decoded.startsWith("//")) return "/"
  return decoded
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const session = await auth()
  const redirectTo = resolveRedirect(searchParams)

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10">
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-br from-background via-background/80 to-background"
        aria-hidden
      />
      <SignInCard session={session} redirectTo={redirectTo} />
    </div>
  )
}
