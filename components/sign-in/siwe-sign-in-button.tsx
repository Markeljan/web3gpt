"use client"

import { useConnectModal } from "@rainbow-me/rainbowkit"
import { useRouter } from "next/navigation"
import { getCsrfToken, signIn } from "next-auth/react"
import { useCallback, useEffect, useState } from "react"
import { SiweMessage } from "siwe"
import { toast } from "sonner"
import { useAccount, useSignMessage } from "wagmi"

import { Button, type ButtonProps } from "@/components/ui/button"
import { IconSpinner } from "@/components/ui/icons"

interface SiweSignInButtonProps extends ButtonProps {
  redirectTo?: string
  label: string
  statement?: string
}

export function SiweSignInButton({
  redirectTo = "/",
  label,
  statement = "Sign in with Ethereum to Web3GPT.",
  disabled,
  ...buttonProps
}: SiweSignInButtonProps) {
  const router = useRouter()
  const { openConnectModal } = useConnectModal()
  const { address, chainId, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const [isLoading, setIsLoading] = useState(false)
  const [awaitingWallet, setAwaitingWallet] = useState(false)

  const signInWithEthereum = useCallback(
    async (fromEffect = false) => {
      try {
        setIsLoading(true)
        if (fromEffect) {
          setAwaitingWallet(false)
        }

        if (!address) {
          throw new Error("Please connect a wallet before signing the message.")
        }

        const nonce = await getCsrfToken()
        if (!nonce) {
          throw new Error("Unable to fetch a nonce from the authentication service.")
        }

        const message = new SiweMessage({
          domain: window.location.host,
          address,
          statement,
          uri: window.location.origin,
          version: "1",
          chainId: chainId ?? 1,
          nonce,
        })

        const signature = await signMessageAsync({
          message: message.prepareMessage(),
        })

        const result = await signIn("credentials", {
          message: JSON.stringify(message),
          signature,
          redirect: false,
          callbackUrl: redirectTo,
        })

        if (result?.error) {
          throw new Error(result.error)
        }

        toast.success("Signed in with Ethereum")

        if (result?.url) {
          window.location.assign(result.url)
          return
        }

        if (redirectTo) {
          router.push(redirectTo)
        }

        router.refresh()
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to sign in with Ethereum."
        console.error(error)
        toast.error(message)
      } finally {
        setIsLoading(false)
        setAwaitingWallet(false)
      }
    },
    [address, chainId, redirectTo, router, signMessageAsync, statement],
  )

  useEffect(() => {
    if (awaitingWallet && isConnected && address && !isLoading) {
      void signInWithEthereum(true)
    }
  }, [address, awaitingWallet, isConnected, isLoading, signInWithEthereum])

  const handleClick = async () => {
    if (isLoading) return

    if (!isConnected || !address) {
      if (openConnectModal) {
        setAwaitingWallet(true)
        openConnectModal()
      } else {
        toast.error("Connect a wallet using the Connect button before signing in.")
      }
      return
    }

    await signInWithEthereum()
  }

  return (
    <Button type="button" onClick={handleClick} disabled={disabled || isLoading} {...buttonProps}>
      {isLoading && <IconSpinner className="mr-2 size-4 animate-spin" />}
      {label}
    </Button>
  )
}
