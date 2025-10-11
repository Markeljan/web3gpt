import { useState } from "react"

import { useAccount } from "wagmi"

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
  DialogTrigger,
} from "@/components/ui/dialog"
import { IconSpinner } from "@/components/ui/icons"
import { storeTokenScriptDeploymentAction } from "@/lib/actions/deploy-contract"
import { useTokenScriptDeploy } from "@/lib/hooks/use-tokenscript-deploy"

export const DeployTokenScriptButton = ({ sourceCode }: { sourceCode: string }) => {
  const { deploy: deployTokenScript } = useTokenScriptDeploy()
  const [explorerUrl, setExplorerUrl] = useState()
  const [isErrorDeploying, setIsErrorDeploying] = useState<boolean>(false)
  const { isDeploying, setIsDeploying, setTokenScriptViewerUrl } = useGlobalStore()
  const { chainId } = useAccount()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleDeployToIPFS = async () => {
    if (!(chainId && sourceCode)) {
      return
    }

    setIsDeploying(true)
    setIsErrorDeploying(false)

    try {
      const deploymentData = await deployTokenScript({ tokenScriptSource: sourceCode })

      if (!deploymentData) {
        throw new Error("Error deploying TokenScript")
      }

      const { cid, txHash, tokenAddress } = deploymentData
      const tokenscriptViewerUrl = `https://viewer.tokenscript.org/?chain=${chainId}&contract=${tokenAddress}`

      await storeTokenScriptDeploymentAction({
        chainId: chainId.toString(),
        deployHash: txHash,
        cid,
        tokenAddress,
      })

      setExplorerUrl(explorerUrl)
      setTokenScriptViewerUrl(tokenscriptViewerUrl)

      setIsDialogOpen(false)
    } catch (_e) {
      setIsErrorDeploying(true)
    } finally {
      setIsDeploying(false)
    }
  }

  return (
    <div className="ml-4 flex w-full justify-end">
      <Dialog
        onOpenChange={(isOpen) => {
          setIsDialogOpen(isOpen)
          if (!(isOpen || isDeploying)) {
            setIsErrorDeploying(false)
          }
        }}
        open={isDialogOpen}
      >
        <DialogTrigger asChild>
          <Button
            className="mr-2 text-primary-foreground"
            onClick={() => {
              setIsDialogOpen(true)
            }}
            size="sm"
            variant="default"
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
                <p className="font-medium text-sm">Deploy using IPFS</p>
                <Badge className="ml-2 rounded" variant="destructive">
                  Standard
                </Badge>
              </div>
              <p className="text-gray-500 text-sm">
                We will deploy the TokenScript to IPFS Then update the ScriptURI on the contract to point to the
                TokenScript
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-4">
            {isErrorDeploying && <p className="text-destructive text-sm">Error deploying TokenScript.</p>}
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
