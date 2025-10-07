"use client"

import { Github, Wallet } from "lucide-react"
import Link from "next/link"
import type { Session } from "next-auth"
import { signIn, signOut } from "next-auth/react"
import { type ComponentType, useMemo, useState } from "react"

import { SiweSignInButton } from "@/components/sign-in/siwe-sign-in-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { IconGitHub, IconSpinner } from "@/components/ui/icons"

interface SignInCardProps {
  session: Session | null
  redirectTo: string
}

function shortenAddress(address?: string | null) {
  if (!address) return null
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

interface StatusRowProps {
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
  connected: boolean
  value?: string | null
}

function StatusRow({ icon: Icon, title, description, connected, value }: StatusRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border bg-muted/40 p-4">
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 font-medium text-foreground">
          <Icon className="size-4 text-muted-foreground" />
          <span>{title}</span>
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {value ? (
          <p className="font-mono text-xs text-muted-foreground" title={value}>
            {value}
          </p>
        ) : null}
      </div>
      <Badge variant={connected ? "default" : "outline"}>{connected ? "Connected" : "Not linked"}</Badge>
    </div>
  )
}

export function SignInCard({ session, redirectTo }: SignInCardProps) {
  const [isGithubLoading, setIsGithubLoading] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  const walletAddress = session?.user?.walletAddress ?? null
  const githubIdentifier = session?.user?.email ?? session?.user?.name ?? session?.user?.githubId ?? null

  const hasWallet = Boolean(walletAddress)
  const hasGithub = Boolean(githubIdentifier)
  const isAuthenticated = Boolean(session)

  const heading = isAuthenticated ? "Manage your account" : "Sign in to Web3GPT"
  const description = isAuthenticated
    ? "Link your GitHub identity and Ethereum wallet to keep deployments and agents in sync."
    : "Choose GitHub or Sign-In with Ethereum. Linking both providers gives you the best Web3GPT experience."

  const githubButtonLabel = useMemo(() => {
    if (hasGithub) {
      return isAuthenticated ? "Re-link GitHub account" : "Continue with GitHub"
    }
    return isAuthenticated ? "Link GitHub account" : "Sign in with GitHub"
  }, [hasGithub, isAuthenticated])

  const walletButtonLabel = useMemo(() => {
    if (hasWallet) {
      return isAuthenticated ? "Re-link wallet" : "Continue with Ethereum"
    }
    return isAuthenticated ? "Link wallet" : "Sign in with Ethereum"
  }, [hasWallet, isAuthenticated])

  const handleGithubSignIn = () => {
    setIsGithubLoading(true)
    void signIn("github", { callbackUrl: redirectTo })
  }

  const handleSignOut = () => {
    setIsSigningOut(true)
    void signOut({ callbackUrl: "/" })
  }

  return (
    <Card className="w-full max-w-xl border-border/60 bg-background/90 shadow-xl backdrop-blur">
      <CardHeader>
        <CardTitle>{heading}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <StatusRow
            icon={Github}
            title="GitHub"
            description="Use your GitHub profile to sync agents and track deployments."
            connected={hasGithub}
            value={githubIdentifier}
          />
          <StatusRow
            icon={Wallet}
            title="Ethereum wallet"
            description="Authenticate with SIWE to sign deployments and access onchain tools."
            connected={hasWallet}
            value={shortenAddress(walletAddress)}
          />
        </div>

        <div className="space-y-2">
          <Button type="button" className="w-full" onClick={handleGithubSignIn} disabled={isGithubLoading}>
            {isGithubLoading ? (
              <IconSpinner className="mr-2 size-4 animate-spin" />
            ) : (
              <IconGitHub className="mr-2 size-4" />
            )}
            {githubButtonLabel}
          </Button>
          <SiweSignInButton className="w-full" variant="outline" redirectTo={redirectTo} label={walletButtonLabel} />
        </div>

        {!isAuthenticated && redirectTo !== "/" ? (
          <p className="text-xs text-muted-foreground">
            You will be redirected to <span className="font-medium text-foreground">{redirectTo}</span> after you finish
            signing in.
          </p>
        ) : null}
      </CardContent>
      <CardFooter className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {isAuthenticated ? (
          <>
            <Button
              type="button"
              variant="ghost"
              className="w-full sm:w-auto"
              onClick={handleSignOut}
              disabled={isSigningOut}
            >
              {isSigningOut && <IconSpinner className="mr-2 size-4 animate-spin" />}
              Sign out
            </Button>
            <Button asChild className="w-full sm:w-auto">
              <Link href={redirectTo}>Continue</Link>
            </Button>
          </>
        ) : (
          <div className="flex w-full items-center justify-center text-xs text-muted-foreground">
            Prefer another method? Link both once you're signed in.
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
