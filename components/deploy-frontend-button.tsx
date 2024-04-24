"use client"

import Link from "next/link"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { IconExternalLink } from "@/components/ui/icons"
import { useGlobalStore } from "@/app/state/global-store"
import toast from "react-hot-toast"
import type { Abi } from "viem"

export function DeployFrontendButton({
  sourceCode,
  address,
  abi
}: {
  sourceCode: string
  address?: string
  abi?: Abi
}) {
  const { lastDeploymentData } = useGlobalStore()
  const [isOpen, setIsOpen] = useState(false)
  const [deployResults, setDeployResults] = useState<{
    junoUrl?: string
    icpUrl?: string
    isError?: boolean
  }>({})
  const { junoUrl, icpUrl, isError } = deployResults
  const _address = address || lastDeploymentData?.address || ""
  const _abi = abi || lastDeploymentData?.abi

  const disabled = !sourceCode || !_address || !_abi

  async function handleDeployFrontend() {
    const deployment = await deployFrontend({
      sourceCode,
      contractAddress: _address,
      abi: _abi
    })

    setDeployResults(deployment)
  }

  return (
    <Dialog onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="mr-2 text-primary-foreground" variant="default" disabled={disabled} size="sm">
          <p className="hidden sm:flex">Deploy Frontend</p>
          <p className="flex sm:hidden">Deploy</p>
        </Button>
      </DialogTrigger>
      <DialogContent className=" sm:max-w-[425px] ">
        <DialogHeader>
          <DialogTitle>Deploy Frontend</DialogTitle>
          <DialogDescription className="pt-2">
            Deploy your frontend on chain. One deployment will be on the Juno blockchain the other will be on ICP as a
            frontend canister.
          </DialogDescription>
        </DialogHeader>

        <div className=" mx-auto flex w-full items-center justify-center gap-4 py-4">
          {isError && <p className="text-sm text-destructive">Error deploying frontend.</p>}
          {junoUrl && (
            <Link href={junoUrl} target="_blank" className="text-sm text-green-500 ">
              View on Juno <IconExternalLink className="ml-1" />
            </Link>
          )}
          {icpUrl && (
            <Link href={icpUrl} target="_blank" className="text-sm text-blue-500">
              View on ICP <IconExternalLink className="ml-1" />
            </Link>
          )}
        </div>

        <DialogFooter>
          <Button className="mb-4 p-6 sm:p-4" disabled={isError} onClick={handleDeployFrontend} variant="secondary">
            Deploy Frontend
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

async function deployFrontend({
  sourceCode,
  contractAddress,
  abi
}: {
  sourceCode: string
  contractAddress: string
  abi: Abi | undefined | string
}) {
  // replace CONTRACT_ABI and CONTRACT_ADDRESS with the actual contract abi and address in the source code
  const abiString = JSON.stringify(abi)
  sourceCode = sourceCode.replace("CONTRACT_ABI", abiString)
  sourceCode = sourceCode.replace("CONTRACT_ADDRESS", contractAddress)

  const res = await toast.promise(
    fetch("http://localhost:4040/deploy-html", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        sourceCode
      })
    }),
    {
      loading: "Deploying frontend...",
      success: "Frontend deployed!",
      error: "Failed to deploy frontend"
    }
  )

  const deployResult = await res.json()

  return deployResult
}
