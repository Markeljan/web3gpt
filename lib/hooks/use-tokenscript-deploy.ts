import { toast } from "sonner"
import { type Hex, encodeFunctionData } from "viem"
import { parseAbiItem } from "viem"
import { useAccount, usePublicClient, useWalletClient } from "wagmi"

import { useGlobalStore } from "@/app/state/global-store"
import { ipfsUploadFile } from "@/lib/actions/ipfs"

export function useWriteToIPFS() {
  const { chain: viemChain } = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient({
    chainId: viemChain?.id || 5003
  })
  const { lastDeploymentData } = useGlobalStore()

  async function deploy({
    tokenScriptSource
  }: {
    tokenScriptSource: string
  }) {
    if (!viemChain || !walletClient) {
      throw new Error("Wallet not available")
    }

    const deployToast = toast.loading("Deploying TokenScript to IPFS...")

    const tokenAddress = lastDeploymentData?.address
    const ipfsCid = await ipfsUploadFile("tokenscript.tsml", tokenScriptSource)

    toast.dismiss(deployToast)

    if (ipfsCid === null) {
      toast.error("Error uploading to IPFS")
      return
    }

    toast.success("TokenScript uploaded: now update scriptURI on token contract")

    const ipfsRoute = [`ipfs://${ipfsCid}`]

    console.log(`ipfsRoute: ${JSON.stringify(ipfsRoute)}`)

    //now set the IPFS route
    const setScriptURIAbi = parseAbiItem("function setScriptURI(string[] memory newScriptURI)")
    let txHash: Hex
    try {
      // Encode the transaction data
      const data = encodeFunctionData({
        abi: [setScriptURIAbi],
        functionName: "setScriptURI",
        args: [ipfsRoute]
      })

      // Send the transaction
      txHash = await walletClient.sendTransaction({
        to: tokenAddress,
        data
      })
    } catch (error) {
      console.log(error)
      return error
    }

    try {
      publicClient &&
        toast.promise(
          publicClient.waitForTransactionReceipt({
            hash: txHash
          }),
          {
            loading: "Waiting for confirmations...",
            success: "Transaction confirmed!",
            error: "Failed to receive enough confirmations"
          }
        )

      //now we can generate the viewer URL

      const chainId = await walletClient.getChainId()

      return `https://viewer.tokenscript.org/?chain=${chainId}&contract=${tokenAddress}`
    } catch (error) {
      console.log(error)

      return "unable to generate viewer url"
    }
  }

  return { deploy }
}
