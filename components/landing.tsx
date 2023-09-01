'use client'

import Image from 'next/image'

export function Landing({}) {
  return (
    <>
    <div className="mx-auto max-w-2xl px-4 text-center border border-gray-600 rounded-2xl mb-16">

      <div className="relative mb-16 mt-24 flex h-8 w-full">
        <Image
          src="/w3gpt-logo.svg"
          alt="web3 gpt logo"
          fill
          sizes="(max-width: 318px) 100vw, 318px"
        />
      </div>
      <p className="scroll-m-20 text-2xl tracking-tight">
        Deploy smart contracts with AI
      </p>

      <div className="flex flex-row">
        <div className="basis-1/3">
          <img src="logo.png" alt="logo" />
          <h3 className="">Write Smart Contracts</h3>
          <p className="">Generate custom smart contracts using a prompt.</p>
        </div>
        <div className="basis-1/3">
          <img src="logo.png" alt="logo" />
          <h3 className="">Deploy to Blockchains</h3>
          <p className="">Generate custom smart contracts using a prompt.</p>
        </div>
        <div className="basis-1/3">
          <img src="logo.png" alt="logo" />
          <h3 className="">Faster Development</h3>
          <p className="">Speed up development and skip the long and complex setups.</p>
        </div>
      </div>

    </div>


    <div className="mx-auto max-w-2xl px-4 text-center border border-gray-600 rounded-2xl mb-16">

      <div className="relative mb-16 mt-24 flex h-8 w-full">
      </div>
      <p className="scroll-m-20 text-2xl tracking-tight">
        Weekly Updates
      </p>

      <p>Sign up for development updates and early access to latest features</p>

      <input type="text" placeholder="Your email"/> <button type="submit">Send</button>

      <p>No spam, we promise :)</p>

    </div>



    </>
  )
}
