'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Player from 'react-lottie-player'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getUserField, storeEmail } from '@/app/actions'
import { isValidEmail } from '@/lib/utils'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'

export function Landing({ }) {
  const [validationError, setValidationError] = useState<string | null>(null)
  const [email, setEmail] = useState<string>('')
  const [localIsSubscribed, setLocalIsSubscribed] = useLocalStorage('email_subscribed', false)

  useEffect(() => {
    async function fetchUserSubscribed() {
      const backendIsSubscribed = await getUserField('email_subscribed')
      if (backendIsSubscribed === true) {
        setLocalIsSubscribed(true)
      } else {
        if (localIsSubscribed !== true) {
          setLocalIsSubscribed(false)
        }
      }
    }

    if (localIsSubscribed !== true) {
      fetchUserSubscribed()
    }
  }, [localIsSubscribed, setLocalIsSubscribed])

  async function handleSubscribe(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!isValidEmail(email)) {
      setValidationError('Please enter a valid email')
      return
    }
    setValidationError(null)
    await storeEmail(email)
    setLocalIsSubscribed(true)
    setEmail('')
    toast.success('Thanks for subscribing!')
  }

  return (
    <>
      <div className="mx-auto mb-8 max-w-2xl rounded-2xl border-gray-600/25 px-4 text-center dark:border-gray-600/50 md:mb-12 md:border">
        <div className="relative my-8 flex h-8 w-full md:my-12">
          <Image
            src="/w3gpt-logo-beta.svg"
            alt="web3 gpt logo"
            priority={true}
            fill
            sizes="(max-width: 318px) 100vw, 318px"
          />
        </div>
        <p className="text-lg font-bold tracking-tight lg:text-2xl lg:font-normal">
          Deploy smart contracts with AI
        </p>

        <div className="grid-row-3 my-5 mb-8 grid grid-flow-row gap-1 md:grid-flow-col md:gap-4">
          <div className="mx-3 grid grid-cols-3 content-center gap-1 md:grid-cols-1 md:gap-4">
            <Player
              play
              loop={false}
              speed={0.5}
              direction={-1}
              path="/lotties/puzzle.json"
              className='h-24 w-24 md:h-32 md:w-full'
            />
            <div className='col-span-2 mt-4 text-left md:col-span-1 md:mt-0 md:text-center'>
              <h3 className="font-bold md:mb-2">Generate</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Generate custom smart contracts using a prompt.
              </p>
            </div>
          </div>

          <div className="mx-3 grid grid-cols-3 content-center gap-1 md:grid-cols-1 md:gap-4">
            <Player
              play
              loop={false}
              speed={0.5}
              direction={1}
              path="/lotties/globe.json"
              className='h-24 w-24 md:h-32 md:w-full'
            />
            <div className='col-span-2 mt-4 text-left md:col-span-1 md:mt-0 md:text-center'>
              <h3 className="font-bold md:mb-2">Deploy</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Deploy your smart contracts from the chat.
              </p>
            </div>
          </div>
          <div className="mx-3 grid grid-cols-3 content-center gap-1 md:grid-cols-1 md:gap-4">
            <Player
              play
              loop={false}
              speed={0.5}
              path="/lotties/clock.json"
              className='h-24 w-24 md:h-32 md:w-full'
            />

            <div className='col-span-2 mt-4 text-left md:col-span-1 md:mt-0 md:text-center'>
              <h3 className="font-bold md:mb-2">Speed Up</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Code faster by skipping long and complex setups.
              </p>
            </div>
          </div>
        </div>
      </div>

      <hr className="mb-4 md:hidden" />

      {localIsSubscribed === false && (
        <div className="mx-auto mb-16 max-w-2xl rounded-2xl border-gray-600/25 px-4 text-center dark:border-gray-600/50 md:border">
          <div className="my-5 flex flex-col gap-4">
            <p className="mt-8 scroll-m-20 text-2xl tracking-tight">
              Weekly Updates
            </p>

            <p className="px-4 text-sm text-gray-600 dark:text-gray-400">
              Sign up for development updates and early access to latest
              features
            </p>

            <div className="flex justify-center gap-2">
              <form
                className="flex justify-center gap-2"
                onSubmit={handleSubscribe}
              >
                <Input
                  className="h-11 w-64 rounded-lg p-3"
                  type="text"
                  placeholder="Your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
                <Button type="submit" className="h-11" size="sm">
                  Send
                </Button>
              </form>
            </div>
            {validationError ? (
              <p className="text-xs text-red-500">{validationError}</p>
            ) : (
              <p className="mb-8 text-xs text-gray-400">
                No spam, we promise :)
              </p>
            )}
          </div>
        </div>
      )}
    </>
  )
}
