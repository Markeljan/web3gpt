'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { useDeployWithWallet } from '@/lib/functions/deploy-contract/wallet-deploy'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { IconExternalLink, IconSpinner } from './ui/icons'
import { useGlobalStore } from '@/app/state/global-store'
import { useNetwork } from 'wagmi'

export function DeployContractButton({ sourceCode }: { sourceCode: string }) {
  const { deploy: deployWithWallet } = useDeployWithWallet()
  const [constructorArgs, setConstructorArgs] = useState<string[]>([])
  const [explorerUrl, setExplorerUrl] = useState<string>('')
  const [ipfsUrl, setIpfsUrl] = useState<string>('')
  const [isErrorDeploying, setIsErrorDeploying] = useState<boolean>(false)
  const { isDeploying, setIsDeploying, isGenerating } = useGlobalStore()
  const { chain } = useNetwork()
  const [unsupportedNetwork, setUnsupportedNetwork] = useState<boolean>(false)

  // check if the network is supported
  useEffect(() => {
    if (chain?.unsupported) {
      setUnsupportedNetwork(true)
    } else {
      setUnsupportedNetwork(false)
    }
  }, [chain])

  // function to get the contract name from the source code
  const getContractName = () => {
    const contractNameRegex = /contract\s+(\w+)/
    const contractNameMatch = contractNameRegex.exec(sourceCode)
    return contractNameMatch ? contractNameMatch[1] : ''
  }

  // function to get the constructor arguments from the source code
  const getConstructorArgs = () => {
    // regex match to get the constructor arguments from the source code.
    // i.e. constructor(uint256 _initialSupply, string memory _name, string memory _symbol) should get uint256 _initialSupply, string memory _name, string memory _symbol
    const constructorArgsRegex = /constructor\(([^)]+)\)/
    const constructorArgsMatch = constructorArgsRegex.exec(sourceCode)
    if (!constructorArgsMatch) return []
    const constructorArgs = constructorArgsMatch[1]
    // split the constructor arguments into an array
    const constructorArgsArray = constructorArgs.split(',')
    // trim the whitespace from each argument
    const trimmedConstructorArgsArray = constructorArgsArray.map(arg =>
      arg.trim()
    )
    // return the array of constructor arguments
    return trimmedConstructorArgsArray
  }

  function generateInputFields() {
    const generatedConstructorArgs = getConstructorArgs()
    const inputFields = generatedConstructorArgs.map((arg, index) => {
      return (
        <div key={index} className="flex flex-col gap-2">
          <Label className="text-sm font-medium">{arg}</Label>
          <Input
            type="text"
            value={constructorArgs[index] || ''}
            onChange={e => {
              const newConstructorArgs = [...constructorArgs]
              newConstructorArgs[index] = e.target.value
              setConstructorArgs(newConstructorArgs)
            }}
            className="rounded-md border border-gray-300 p-2"
          />
        </div>
      )
    })
    return inputFields
  }

  // Handler for deploy with wallet
  const handleDeployWithWallet = async () => {
    setIsDeploying(true)
    setIsErrorDeploying(false)
    try {
      const { explorerUrl, ipfsUrl } = await deployWithWallet({
        contractName: getContractName(),
        sourceCode,
        constructorArgs: constructorArgs
      })
      setExplorerUrl(explorerUrl)
      setIpfsUrl(ipfsUrl)

      setIsDeploying(false)
    } catch (e) {
      console.log(e)
      setIsErrorDeploying(true)
      setIsDeploying(false)
    }
  }
  return (
    <div className="ml-4 flex w-full justify-end">
      <Dialog
        onOpenChange={isOpen => {
          if (!isOpen && !isDeploying) {
            setExplorerUrl('')
            setIpfsUrl('')
            setConstructorArgs([])
            setIsErrorDeploying(false)
          }
        }}
      >
        <DialogTrigger asChild>
          <Button
            className="mr-2 text-primary-foreground"
            variant="default"
            disabled={unsupportedNetwork || isGenerating}
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
              Deploy the contract using your wallet. Must be connected to a
              supported testnet.
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
                Sign and deploy the contract using your own wallet. Be cautious
                of risks and network fees.
              </p>
            </div>
            {getConstructorArgs().length > 0 && (
              <div className="flex max-h-48 flex-col gap-4 overflow-y-auto rounded border-2 p-4">
                <DialogTitle className="text-md">
                  Constructor Arguments
                </DialogTitle>
                {generateInputFields()}
              </div>
            )}
          </div>
          <div className="flex flex-col items-center gap-4 py-4">
            {isErrorDeploying && (
              <p className="text-sm text-destructive">
                Error deploying contract.
              </p>
            )}
            {isDeploying && (
              <IconSpinner className="h-8 w-8 animate-spin text-gray-500" />
            )}
            {explorerUrl && (
              <Link
                href={explorerUrl}
                target="_blank"
                className="text-sm text-green-500"
              >
                <div className="flex items-center">
                  View on Explorer
                  <IconExternalLink className="ml-1" />
                </div>
              </Link>
            )}
            {ipfsUrl && (
              <Link
                href={ipfsUrl}
                target="_blank"
                className="text-sm text-blue-500"
              >
                <div className="flex items-center">
                  View on IPFS
                  <IconExternalLink className="ml-1" />
                </div>
              </Link>
            )}
          </div>

          <DialogFooter>
            <Button
              className="mb-4 p-6 sm:p-4"
              disabled={isDeploying}
              onClick={handleDeployWithWallet}
              variant="secondary"
            >
              Deploy with Wallet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
