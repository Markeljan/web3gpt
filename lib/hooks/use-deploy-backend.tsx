import { useGlobalStore } from '@/app/state/global-store'
import { usePublicClient } from 'wagmi'

export async function useDeployBackend() {
  const {
    globalConfig,
    deployContractConfig,
    setVerifyContractConfig,
    setIsDeploying,
    setIsVerifying
  } = useGlobalStore()
  const chainId = deployContractConfig?.chainId || globalConfig.viemChain.id

  const publicClient = usePublicClient({
    chainId: Number(chainId)
  })

  setIsDeploying(true)

  const deployContractResponse = await fetch('/api/deploy-contract', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(deployContractConfig)
  })

  setIsDeploying(false)

  if (deployContractResponse.ok) {
    const { explorerUrl, ipfsUrl, verifyContractConfig } = await deployContractResponse.json()
    setIsVerifying(true)

    try {
      console.log('waiting for 4 confirmations')
      const transactionReceipt = await publicClient.waitForTransactionReceipt({
        hash: verifyContractConfig?.deployHash,
        confirmations: 4
      })
      console.log('got 4 confirmations, verifying contract')
      if (transactionReceipt) {
        const verifyContractResponse = await fetch('/api/verify-contract', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(verifyContractConfig)
        })
        if (verifyContractResponse.ok) {
          console.log('contract verified successfully')
        }
      }
    } catch (e) {
      console.log('Verification failed, may need more confirmations.', e)
    }

    setIsVerifying(false)

  }

  
