'use client'

import Image from 'next/image'
import { Player } from '@lottiefiles/react-lottie-player';
import { Button } from './ui/button';
import { Input } from './ui/input';

export function Landing({ }) {
  return (
    <>
      <div className="mx-auto max-w-2xl px-4 text-center border border-gray-600 rounded-2xl mb-16">

        <div className="relative my-12 flex h-8 w-full">
          <Image
            src="/w3gpt-logo.svg"
            alt="web3 gpt logo"
            fill
            sizes="(max-width: 318px) 100vw, 318px"
          />
        </div>
        <p className="text-2xl tracking-tight">
          Deploy smart contracts with AI
        </p>

        <div className="grid grid-row-3 gap-4 grid-flow-col my-5 mb-8">

          <div className="grid grid-cols-1 gap-4 content-center mx-3">

            <Player
              autoplay
              loop={false}
              speed={.5}
              direction={-1}
              keepLastFrame={true}
              src="lotties/puzzle.json"
              style={{ height: '100px', width: '100px' }}
            />


            <h3 className="font-bold">Generate</h3>
            <p className="text-sm text-gray-400">Generate custom smart contracts using a prompt.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 content-center mx-3">

            <Player
              autoplay
              loop={false}
              speed={1}
              direction={1}
              keepLastFrame={true}
              src="lotties/globe.json"
              style={{ height: '100px', width: '100px' }}
            />
            <h3 className="font-bold">Deploy</h3>
            <p className="text-sm text-gray-400">Deploy your smart contracts from the chat.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 content-center mx-3">

            <Player
              autoplay
              loop={false}
              speed={1}
              keepLastFrame={true}
              src="lotties/clock.json"
              style={{ height: '100px', width: '100px' }}
            />

            <h3 className="font-bold">Speed Up</h3>
            <p className="text-sm text-gray-400">Code faster by skipping long and complex setups.</p>
          </div>
        </div>

      </div>


      <div className="mx-auto max-w-2xl px-4 text-center border border-gray-600 rounded-2xl mb-16">

        <div className="flex flex-col gap-4 my-5">

          <p className="scroll-m-20 text-2xl tracking-tight mt-8">
            Weekly Updates
          </p>

          <p className='text-sm text-gray-400'>Sign up for development updates and early access to latest features</p>

          <div className='flex justify-center gap-2'>
            <Input className='rounded-lg p-3 w-64 h-11' type="text" placeholder="Your email" />
            <Button type="submit" className="h-11" size="sm">
              Send
            </Button>
          </div>

          <p className='text-xs text-gray-400 mb-8'>No spam, we promise :)</p>
          
        </div>
      </div>




    </>
  )
}
