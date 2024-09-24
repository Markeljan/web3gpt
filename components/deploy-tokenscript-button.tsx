"use client"

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
import { IconSpinner } from "@/components/ui/icons"
import { useTokenScriptDeploy } from "@/lib/hooks/use-tokenscript-deploy"

type DeployContractButtonProps = {
  getSourceCode: () => string
}

export const DeployTokenScriptButton = ({ getSourceCode }: DeployContractButtonProps) => {
  const { deploy: deployIPFS } = useTokenScriptDeploy()
  const [explorerUrl, setExplorerUrl] = useState<string>("")
  const [isErrorDeploying, setIsErrorDeploying] = useState<boolean>(false)
  const [sourceCode, setSourceCode] = useState<string>("")
  const { isDeploying, setIsDeploying, setTokenScriptViewerUrl } = useGlobalStore()
  const supportedChains = useChains()
  const { chain } = useAccount()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const isSupportedChain = useMemo(
    () => !!chain && supportedChains.find((c) => c.id === chain.id),
    [chain, supportedChains]
  )

  const handleDeployToIPFS = async () => {
    setIsDeploying(true)
    setIsErrorDeploying(false)
    try {
      const tokenscriptViewerUrl = await deployIPFS({
        tokenScriptSource: sourceCode
      })
      if (!tokenscriptViewerUrl) {
        setIsErrorDeploying(true)
        setIsDeploying(false)
        return
      }

      explorerUrl && setExplorerUrl(explorerUrl)
      setTokenScriptViewerUrl(tokenscriptViewerUrl as string)

      setIsDeploying(false)
      setIsDialogOpen(false) // Close the dialog
    } catch (e) {
      console.error(e)
      setIsErrorDeploying(true)
      setIsDeploying(false)
    }
  }

  return (
    <div className="ml-4 flex w-full justify-end">
      <Dialog
        open={isDialogOpen}
        onOpenChange={(isOpen) => {
          setIsDialogOpen(isOpen)
          if (!isOpen && !isDeploying) {
            setIsErrorDeploying(false)
          }
        }}
      >
        <DialogTrigger asChild>
          <Button
            onClick={() => {
              setSourceCode(getSourceCode())
              setIsDialogOpen(true)
            }}
            className="mr-2 text-primary-foreground"
            variant="default"
            disabled={!isSupportedChain}
            size="sm"
          >
            <p className="hidden sm:flex">Deploy TokenScript</p>
            <p className="flex sm:hidden">Deploy</p>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Manually Deploy TokenScript</DialogTitle>
            <DialogDescription>Deploy the TokenScript.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <div className="flex">
                <p className="text-sm font-medium">Deploy using IPFS</p>
                <Badge variant="destructive" className="ml-2 rounded">
                  Standard
                </Badge>
              </div>
              <p className="text-sm text-gray-500">
                We will deploy the TokenScript to IPFS Then update the ScriptURI on the contract to point to the
                TokenScript
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-4">
            {isErrorDeploying && <p className="text-sm text-destructive">Error deploying TokenScript.</p>}
            {isDeploying && <IconSpinner className="size-8 animate-spin text-gray-500" />}
          </div>

          <DialogFooter>
            <Button className="mb-4 p-6 sm:p-4" disabled={isDeploying} onClick={handleDeployToIPFS} variant="secondary">
              Deploy to IPFS
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
