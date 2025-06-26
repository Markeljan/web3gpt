"use client"

import { useEffect, useState } from "react"

import Player from "react-lottie-player"
import { toast } from "sonner"

import { CustomLogoText, W3GPTLogo } from "@/components/header/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getUserFieldAction, storeEmailAction } from "@/lib/actions/chat"
import { useIsClient } from "@/lib/hooks/use-is-client"
import { useLocalStorage } from "@/lib/hooks/use-local-storage"
import { isValidEmail } from "@/lib/utils"

type LandingProps = {
  userId?: string
  disableAnimations?: boolean
}

export function Landing({ userId, disableAnimations }: LandingProps) {
  const [validationError, setValidationError] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [localIsSubscribed, setLocalIsSubscribed] = useLocalStorage("email_subscribed", false)
  const isClient = useIsClient()

  useEffect(() => {
    const fetchIsEmailSubscribed = async () => {
      const backendIsSubscribed = await getUserFieldAction("email_subscribed")
      if (!!backendIsSubscribed === true) {
        setLocalIsSubscribed(true)
      }
    }

    if (localIsSubscribed !== true && userId && isClient) {
      fetchIsEmailSubscribed()
    }
  }, [localIsSubscribed, setLocalIsSubscribed, userId, isClient])

  async function handleSubscribe(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!isValidEmail(email)) {
      setValidationError("Please enter a valid email")
      return
    }
    setValidationError(null)
    await storeEmailAction(email)
    setLocalIsSubscribed(true)
    setEmail("")
    toast.success("Thanks for subscribing!")
  }

  return (
    <>
      <div className="flex flex-col mx-auto max-w-2xl text-center  mb-4 p-4 py-8 pointer-events-none select-none">
        <div className="max-sm:flex-col flex items-center justify-center gap-3 mb-6">
          <W3GPTLogo variant="xl" />
          <CustomLogoText variant="xl">Ready, Set, Deploy</CustomLogoText>
        </div>

        <div className="max-sm:w-full max-sm:flex max-sm:mx-auto  max-sm:justify-center grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-center gap-3">
            <Player
              play={!disableAnimations}
              loop={false}
              speed={0.5}
              direction={-1}
              path="/lotties/puzzle.json"
              className="size-8 flex-shrink-0"
            />
            <div className="text-left">
              <h3 className="font-medium text-sm">Generate</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">Prompt smart contracts</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Player
              play={!disableAnimations}
              loop={false}
              speed={0.5}
              path="/lotties/clock.json"
              className="size-8 flex-shrink-0"
            />
            <div className="text-left">
              <h3 className="font-medium text-sm">Speed up</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">Skip the boilerplate</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Player
              play={!disableAnimations}
              loop={false}
              speed={0.5}
              direction={1}
              path="/lotties/globe.json"
              className="size-8 flex-shrink-0"
            />
            <div className="text-left">
              <h3 className="font-medium text-sm">Deploy</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">Directly from chat</p>
            </div>
          </div>
        </div>
      </div>

      {isClient && localIsSubscribed === false ? (
        <div className="mx-auto max-w-2xl rounded-lg border-gray-600/20 p-4 text-center dark:border-gray-600/30 border bg-background/50 mb-4">
          <h3 className="font-medium mb-2">Early Access</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Get updates and early access to features</p>
          <form className="flex gap-2 justify-center" onSubmit={handleSubscribe}>
            <Input
              className="h-9 w-48 text-sm"
              type="text"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" className="h-9" size="sm">
              Send
            </Button>
          </form>
          {validationError ? (
            <p className="text-xs text-red-500 mt-2">{validationError}</p>
          ) : (
            <p className="text-xs text-gray-400 mt-2">No spam, promise :)</p>
          )}
        </div>
      ) : null}
    </>
  )
}
