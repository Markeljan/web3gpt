"use client"
import Link from "next/link"
import { useMemo, useState } from "react"

import { useAccount, useChains } from "wagmi"

import { useGlobalStore } from "@/app/state/global-store"
import { Badge } from "@/components/ui/badge"
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
import { IconExternalLink, IconSpinner } from "@/components/ui/icons"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useDeployWithWallet } from "@/lib/functions/deploy-contract/wallet-deploy"
import { nanoid } from "@/lib/utils"

type DeployContractButtonProps = {
  getSourceCode: () => string
}

export const DeployContractButton = ({ getSourceCode }: DeployContractButtonProps) => {
  const { deploy: deployWithWallet } = useDeployWithWallet()
  const [sourceCode, setSourceCode] = useState<string>("")
  const [explorerUrl, setExplorerUrl] = useState<string>("")
  const [ipfsUrl, setIpfsUrl] = useState<string>("")
  const [isErrorDeploying, setIsErrorDeploying] = useState<boolean>(false)
  const { isDeploying, setIsDeploying, isGenerating } = useGlobalStore()
  const supportedChains = useChains()
  const { chain } = useAccount()

  const isSupportedChain = useMemo(
    () => !!chain && supportedChains.find((c) => c.id === chain.id),
    [chain, supportedChains]
  )

  const { contractName, constructorArgs, inputFields } = useMemo(() => {
    const contractName = getContractName(sourceCode)
    const constructorArgs = generateConstructorArgs(sourceCode)
    const inputFields = generateInputFields(sourceCode, constructorArgs)
    return { contractName, constructorArgs, inputFields }
  }, [sourceCode])

  const handleClickDeploy = async () => {
    setIsDeploying(true)
    setIsErrorDeploying(false)
    const sourceCode = getSourceCode()
    setSourceCode(sourceCode)
    try {
      const { explorerUrl, ipfsUrl } = await deployWithWallet({
        contractName,
        sourceCode,
        constructorArgs
      })
      explorerUrl && setExplorerUrl(explorerUrl)
      setIpfsUrl(ipfsUrl)

      setIsDeploying(false)
    } catch (e) {
      console.error(e)
      setIsErrorDeploying(true)
      setIsDeploying(false)
    }
  }
  return (
    <div className="ml-4 flex w-full justify-end">
      <Dialog
        onOpenChange={(isOpen) => {
          if (!isOpen && !isDeploying) {
            setExplorerUrl("")
            setIpfsUrl("")
            setIsErrorDeploying(false)
          }
        }}
      >
        <DialogTrigger asChild>
          <Button
            className="mr-2 text-primary-foreground"
            variant="default"
            disabled={!isSupportedChain || isGenerating}
            size="sm"
          >
            <p className="hidden sm:flex">Deploy Contract</p>
            <p className="flex sm:hidden">Deploy</p>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Manually Deploy Contract</DialogTitle>
            <DialogDescription>
              Deploy the contract using your wallet. Must be connected to a supported testnet.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <div className="flex">
                <p className="text-sm font-medium">Agent Deploy</p>
                <Badge variant="default" className="ml-2 rounded">
                  RECOMMENDED
                </Badge>
              </div>
              <p className="text-sm text-gray-500">
                {`This method does not require wallet connection. Just use the keyword "deploy" in the chat.`}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex">
                <p className="text-sm font-medium">Deploy with Wallet</p>
                <Badge variant="destructive" className="ml-2 rounded">
                  ADVANCED
                </Badge>
              </div>
              <p className="text-sm text-gray-500">
                Sign and deploy the contract using your own wallet. Be cautious of risks and network fees.
              </p>
            </div>
            {constructorArgs.length > 0 && (
              <div className="flex max-h-48 flex-col gap-4 overflow-y-auto rounded border-2 p-4">
                <DialogTitle className="text-md">Constructor Arguments</DialogTitle>
                {inputFields}
              </div>
            )}
          </div>
          <div className="flex flex-col items-center gap-4 py-4">
            {isErrorDeploying && <p className="text-sm text-destructive">Error deploying contract.</p>}
            {isDeploying && <IconSpinner className="size-8 animate-spin text-gray-500" />}
            {explorerUrl && (
              <Link href={explorerUrl} target="_blank" className="text-sm text-green-500">
                <div className="flex items-center">
                  View on Explorer
                  <IconExternalLink className="ml-1" />
                </div>
              </Link>
            )}
            {ipfsUrl && (
              <Link href={ipfsUrl} target="_blank" className="text-sm text-blue-500">
                <div className="flex items-center">
                  View on IPFS
                  <IconExternalLink className="ml-1" />
                </div>
              </Link>
            )}
          </div>

          <DialogFooter>
            <Button className="mb-4 p-6 sm:p-4" disabled={isDeploying} onClick={handleClickDeploy} variant="secondary">
              Deploy with Wallet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// function to get the contract name from the source code
const getContractName = (sourceCode: string) => {
  const contractNameRegex = /contract\s+(\w+)\s*(?:is|{)/
  const contractNameMatch = contractNameRegex.exec(sourceCode)
  return contractNameMatch ? contractNameMatch[1] : ""
}

const generateConstructorArgs = (sourceCode: string) => {
  // regex match to get the constructor arguments from the source code.
  const constructorArgsRegex = /constructor\(([^)]+)\)/
  const constructorArgsMatch = constructorArgsRegex.exec(sourceCode)
  if (!constructorArgsMatch) return []
  const constructorArgs = constructorArgsMatch[1]
  // split the constructor arguments into an array
  const constructorArgsArray = constructorArgs.split(",")
  // trim the whitespace from each argument
  const trimmedConstructorArgsArray = constructorArgsArray.map((arg) => arg.trim())
  // return the array of constructor arguments
  return trimmedConstructorArgsArray
}

function generateInputFields(sourceCode: string, constructorArgs: string[]) {
  const generatedConstructorArgs = generateConstructorArgs(sourceCode)
  const inputFields = generatedConstructorArgs.map((arg, index) => {
    return (
      <div key={`${arg}-${nanoid()}`} className="flex flex-col gap-2">
        <Label className="text-sm font-medium">{arg}</Label>
        <Input
          type="text"
          value={constructorArgs[index] || ""}
          onChange={(e) => {
            const newConstructorArgs = [...constructorArgs]
            newConstructorArgs[index] = e.target.value
          }}
          className="rounded-md border border-gray-300 p-2"
        />
      </div>
    )
  })
  return inputFields
}
