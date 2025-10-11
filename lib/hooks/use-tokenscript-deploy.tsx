import { toast } from "sonner"
import { encodeFunctionData, parseAbiItem, publicActions } from "viem"
import { useAccount, useWalletClient } from "wagmi"

import { useGlobalStore } from "@/app/state/global-store"
import { ipfsUploadFileAction } from "@/lib/actions/deploy-contract"

export function useTokenScriptDeploy() {
  const { chain: viemChain, chainId, address } = useAccount()
  const { data } = useWalletClient({
    chainId,
  })
  const walletClient = data?.extend(publicActions)

  const { lastDeploymentData } = useGlobalStore()

  async function deploy({ tokenScriptSource }: { tokenScriptSource: string }): Promise<
    | {
        txHash: string
        cid: string
        tokenAddress: string
      }
    | undefined
  > {
    if (!(viemChain && walletClient)) {
      throw new Error("Provider or wallet not available")
    }
    if (!lastDeploymentData) {
      throw new Error("No token deployment data found")
    }

    const deployToast = toast.loading("Deploying TokenScript to IPFS...")

    const tokenAddress = lastDeploymentData.contractAddress
    if (address !== lastDeploymentData.walletAddress) {
      toast.error("Last deployment must be from the connected wallet")
      return
    }
    const cid = await ipfsUploadFileAction("tokenscript.tsml", tokenScriptSource)

    toast.dismiss(deployToast)

    if (!cid) {
      toast.error("Error uploading to IPFS")
      return
    }

    toast.success("TokenScript uploaded!  Updating contract scriptURI...")

    const ipfsRoute = [`ipfs://${cid}`]

    const setScriptURIAbi = parseAbiItem("function setScriptURI(string[] memory newScriptURI)")
    try {
      const encodedData = encodeFunctionData({
        abi: [setScriptURIAbi],
        functionName: "setScriptURI",
        args: [ipfsRoute],
      })

      const txHash = await walletClient.sendTransaction({
        to: tokenAddress,
        data: encodedData,
      })

      const transactionReceipt = await walletClient.waitForTransactionReceipt({
        hash: txHash,
      })

      if (!transactionReceipt) {
        toast.error("Failed to receive enough confirmations")
        return
      }
      toast.success("Transaction confirmed!")

      return {
        txHash,
        cid,
        tokenAddress,
      }
    } catch (_error) {
      toast.error("Failed to deploy TokenScript")
      return
    }
  }

  return { deploy }
}
