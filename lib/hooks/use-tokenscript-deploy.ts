import { toast } from "sonner"
import { encodeFunctionData, parseAbiItem, publicActions } from "viem"
import { useAccount, useWalletClient } from "wagmi"

import { useGlobalStore } from "@/app/state/global-store"
import { storeTokenScriptDeployment } from "@/lib/actions/db"
import { ipfsUploadFile } from "@/lib/actions/ipfs"

export function useTokenScriptDeploy() {
  const { chain: viemChain, chainId, address } = useAccount()
  const { data } = useWalletClient({
    chainId
  })
  const walletClient = data?.extend(publicActions)

  const { lastDeploymentData } = useGlobalStore()

  async function deploy({ tokenScriptSource }: { tokenScriptSource: string }) {
    if (!viemChain || !walletClient) {
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
    const ipfsCid = await ipfsUploadFile("tokenscript.tsml", tokenScriptSource)

    toast.dismiss(deployToast)

    if (ipfsCid === null) {
      toast.error("Error uploading to IPFS")
      return
    }

    toast.success("TokenScript uploaded!  Updating contract scriptURI...")

    const ipfsRoute = [`ipfs://${ipfsCid}`]

    const setScriptURIAbi = parseAbiItem("function setScriptURI(string[] memory newScriptURI)")
    try {
      const data = encodeFunctionData({
        abi: [setScriptURIAbi],
        functionName: "setScriptURI",
        args: [ipfsRoute]
      })

      const txHash = await walletClient.sendTransaction({
        to: tokenAddress,
        data
      })

      const transactionReceipt = await walletClient.waitForTransactionReceipt({
        hash: txHash
      })

      if (!transactionReceipt) {
        toast.error("Failed to receive enough confirmations")
        return
      }
      toast.success("Transaction confirmed!")

      const chainId = await walletClient.getChainId()

      await storeTokenScriptDeployment({
        chainId: chainId.toString(),
        deployHash: txHash,
        cid: ipfsCid,
        tokenAddress
      })

      return `https://viewer.tokenscript.org/?chain=${chainId}&contract=${tokenAddress}`
    } catch (error) {
      console.error(error)
      toast.error("Failed to deploy TokenScript")
      return "unable to generate viewer url"
    }
  }

  return { deploy }
}
