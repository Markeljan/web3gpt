import { VerifyContractParams } from '@/lib/functions/types'
import handleImports from '@/lib/functions/deploy-contract/handle-imports'
import { getExplorerUrl } from '@/lib/viem-utils'
import { encodeDeployData } from 'viem'
import { useNetwork, usePublicClient, useWalletClient } from 'wagmi'
import toast from 'react-hot-toast'

export function useDeployWithWallet() {
  const { chain: viemChain } = useNetwork()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient({
    chainId: viemChain?.id
  })

  async function deploy({
    contractName,
    sourceCode,
    constructorArgs
  }: {
    contractName: string
    sourceCode: string
    constructorArgs: Array<string>
  }) {
    if (!viemChain || !walletClient) {
      throw new Error('Wallet not available')
    }
    const fileName = contractName.replace(/[\/\\:*?"<>|.\s]+$/g, '_') + '.sol'

    // Prepare the sources object for the Solidity compiler
    const handleImportsResult = await handleImports(sourceCode)

    const sources = {
      [fileName]: {
        content: handleImportsResult?.sourceCode
      },
      ...handleImportsResult?.sources
    }
    const sourcesKeys = Object.keys(sources)

    // Loop over each source
    for (const sourceKey of sourcesKeys) {
      let sourceCode = sources[sourceKey].content

      // Find all import statements in the source code
      const importStatements =
        sourceCode.match(/import\s+["'][^"']+["'];/g) || []

      // Loop over each import statement
      for (const importStatement of importStatements) {
        // Extract the file name from the import statement
        const importPathMatch = importStatement.match(/["']([^"']+)["']/)

        // If no import path is found, continue to the next statement
        if (!importPathMatch) continue

        // Extract the file name from the path
        const importPath = importPathMatch[1]
        const fileName = importPath.split('/').pop() || importPath

        // Check if the file is already in the sources object
        // if (sources[fileName]) continue;

        // Replace the import statement with the new import statement
        sourceCode = sourceCode.replace(
          importStatement,
          `import "${fileName}";`
        )
      }

      // Update the source content in your sources object
      sources[sourceKey].content = sourceCode
    }

    // Compile the contract
    // TODO: enable optimizer
    const standardJsonInput = JSON.stringify({
      language: 'Solidity',
      sources,
      settings: {
        evmVersion: 'paris',
        outputSelection: {
          '*': {
            '*': ['*']
          }
        }
      }
    })

    const compileContractResponse = await fetch('/api/compile-contract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        standardJsonInput,
        contractName
      })
    })

    const compileResult = await compileContractResponse.json()
    const { abi, bytecode } = compileResult

    const parsedConstructorArgs = constructorArgs.map(arg => {
      if (arg.startsWith('[') && arg.endsWith(']')) {
        // Check if the string doesn't have double or single quotes after '[' and before ']'
        if (arg.match(/(?<=\[)(?=[^"'])(.*)(?<=[^"'])(?=\])/g)) {
          // Split the string by commas and remove the brackets
          const elements = arg.slice(1, -1).split(',')

          // Trim each element to remove extra spaces and return as an array
          return elements.map(item => item.trim())
        }
      }

      // Try parsing as JSON, or return the original argument
      try {
        return JSON.parse(arg)
      } catch (error) {
        return arg
      }
    })

    const deployData = encodeDeployData({
      abi: abi,
      bytecode: bytecode,
      args: parsedConstructorArgs
    })

    const [account] = await walletClient.getAddresses()

    const deployHash = await toast.promise(
      walletClient.deployContract({
        abi: abi,
        bytecode: bytecode,
        account: account,
        args: parsedConstructorArgs
      }),
      {
        loading: 'Sending deploy transaction...',
        success: 'Deploy transaction submitted!',
        error: 'Failed to deploy contract'
      }
    )

    const explorerUrl = `${getExplorerUrl(viemChain)}/tx/${deployHash}`

    const ipfsUploadResponse = await fetch('/api/ipfs-upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sources,
        abi,
        bytecode,
        standardJsonInput
      })
    })

    const ipfsCid = await ipfsUploadResponse.json()
    const ipfsUrl = `https://nftstorage.link/ipfs/${ipfsCid}`

    const encodedConstructorArgs = deployData.slice(bytecode?.length)

    const verifyContractConfig: VerifyContractParams = {
      deployHash,
      standardJsonInput,
      encodedConstructorArgs,
      fileName,
      contractName,
      viemChain
    }

    try {
      const transactionReceipt = await toast.promise(
        publicClient.waitForTransactionReceipt({
          hash: verifyContractConfig?.deployHash,
          confirmations: 5
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
            success: 'Contract verified successfully!',
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
      const deploymentData = {
        explorerUrl,
        ipfsUrl,
        verifyContractConfig
      }

      return deploymentData
    } catch (error) {
      console.log(error)
      return {
        explorerUrl,
        ipfsUrl,
        verificationStatus: 'failed'
      }
    }
  }

  return { deploy }
}
