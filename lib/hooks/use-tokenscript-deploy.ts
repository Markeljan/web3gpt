import type { VerifyContractParams } from "@/lib/functions/types"
import handleImports from "@/lib/functions/deploy-contract/handle-imports"
import { getExplorerUrl } from "@/lib/viem-utils"
import { encodeFunctionData } from "viem"
import { useAccount, usePublicClient, useWalletClient } from "wagmi"
import { toast } from "sonner"
import { useGlobalStore } from "@/app/state/global-store"
import { track } from "@vercel/analytics"
import { parseAbiItem } from "viem";
import ipfsStoreFilePin from "./ipfs-ts-upload-pin"
//import ipfsStoreFile from "./ipfs-ts-upload"

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

    let deployToast = toast.loading("Deploying TokenScript to IPFS...");

    const tokenAddress = lastDeploymentData?.address;
    const ipfsCid = await ipfsStoreFilePin(tokenScriptSource);
    //const ipfsCid = await ipfsStoreFile(tokenScriptSource);

    toast.dismiss(deployToast);

    if (ipfsCid === null) {
      toast.error("Error uploading to IPFS");
      return;
    } else {
      toast.success("TokenScript uploaded: now update scriptURI on token contract")
    }

    const ipfsRoute = [`ipfs://${ipfsCid}`];

    console.log(`ipfsRoute: ${JSON.stringify(ipfsRoute)}`);

    //now set the IPFS route
    const setScriptURIAbi = parseAbiItem('function setScriptURI(string[] memory newScriptURI)');
    let txHash;
    try {
      // Encode the transaction data
      const data = encodeFunctionData({
        abi: [setScriptURIAbi],
        functionName: 'setScriptURI',
        args: [ipfsRoute]
      });

      // Send the transaction
    txHash = await walletClient.sendTransaction({
      to: tokenAddress,
      data,
      /*gas: '2000000', // Adjust the gas limit as needed
      gasPrice: '50000000000' // Adjust the gas price as needed*/
    });
  } catch (error) {
    console.log(error)
    return error
  }


    try {
      const transactionReceipt =
        publicClient &&
        (await toast.promise(
          publicClient.waitForTransactionReceipt({
            hash: txHash
          }),
          {
            loading: "Waiting for confirmations...",
            success: "Transaction confirmed!",
            error: "Failed to receive enough confirmations"
          }
        ))

        //now we can generate the viewer URL

        const chainId = await walletClient.getChainId();
        
      return `https://viewer.tokenscript.org/?chain=${chainId}&contract=${tokenAddress}`;
    } catch (error) {
      console.log(error)
    
      return "unable to generate viewer url";
  }
}

  return { deploy }
}
