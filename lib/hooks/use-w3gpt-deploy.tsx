import { usePublicClient } from 'wagmi'
import { useGlobalStore } from '@/app/state/global-store'
import {
  DeployContractParams,
  DeployContractResult
} from '@/lib/functions/types'
import toast from 'react-hot-toast'

export function useW3GPTDeploy() {
  const { globalConfig, deployContractConfig, setIsDeploying, setIsVerifying } =
    useGlobalStore()
  const chainId = deployContractConfig?.chainId
  const publicClient = usePublicClient({
    chainId: Number(chainId)
  })

  async function deploy(_deployContractConfig?: DeployContractParams) {
    setIsDeploying(true)

    const deployContractResponse = await toast.promise(
      fetch('/api/deploy-contract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(_deployContractConfig || deployContractConfig)
      }),
      {
        loading: 'Sending deploy transaction...',
        success: 'Deploy transaction submitted!',
        error: 'Failed to send deploy transaction'
      }
    )

    setIsDeploying(false)

    if (deployContractResponse.ok) {
      setIsVerifying(true)
      const {
        explorerUrl,
        ipfsUrl,
        verifyContractConfig
      }: DeployContractResult = await deployContractResponse.json()

      try {
        const transactionReceipt = await toast.promise(
          publicClient.waitForTransactionReceipt({
            hash: verifyContractConfig?.deployHash,
            confirmations: 6
          }),
          {
            loading: 'Waiting for confirmations...',
            success: 'Received enough confirmations',
            error: 'Failed to receive enough confirmations'
          }
        )
        if (transactionReceipt) {
          const verifiedContractResponse = await toast.promise(
            fetch('/api/verify-contract', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(verifyContractConfig)
            }),
            {
              loading: 'Verifying contract...',
              success: 'Contract verified successfully',
              error: 'Failed to verify contract'
            }
          )

          const verifiedContractAddress = await verifiedContractResponse.json()

          if (verifiedContractAddress) {
            return {
              explorerUrl:
                explorerUrl.split('/tx')[0] +
                `/address/${verifiedContractAddress}`,
              ipfsUrl,
              verificationStatus: 'success'
            }
          }
        }
        setIsVerifying(false)
        return { explorerUrl, ipfsUrl, verificationStatus: 'failed' }
      } catch (e) {
        setIsVerifying(false)
        return { explorerUrl, ipfsUrl, verificationStatus: 'failed' }
      }
    } else {
      return {
        error:
          'Failed to deploy contract: ' +
          (await deployContractResponse.json()).error
      }
    }
  }

  return { deploy }
}
