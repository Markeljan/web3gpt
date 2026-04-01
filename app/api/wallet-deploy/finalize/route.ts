import { track } from "@vercel/analytics/server"
import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { getChainById } from "@/lib/config"
import { ipfsUploadDir } from "@/lib/data/ipfs"
import { deleteWalletDeployArtifact, getWalletDeployArtifact, storeDeployment, storeVerification } from "@/lib/data/kv"
import { getContractFileName } from "@/lib/solidity/utils"
import type { VerifyContractParams } from "@/lib/types"
import { getExplorerUrl, getIpfsUrl } from "@/lib/utils"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const artifactId = typeof body?.artifactId === "string" ? body.artifactId : ""
    const deployHash = typeof body?.deployHash === "string" ? body.deployHash : ""
    const contractAddress = typeof body?.contractAddress === "string" ? body.contractAddress : ""
    const deployerAddress = typeof body?.deployerAddress === "string" ? body.deployerAddress : ""
    const encodedConstructorArgs = typeof body?.encodedConstructorArgs === "string" ? body.encodedConstructorArgs : ""
    const chainId = Number(body?.chainId)

    if (!(artifactId && deployHash && contractAddress && deployerAddress && Number.isFinite(chainId))) {
      return NextResponse.json(
        { error: "artifactId, deployHash, contractAddress, deployerAddress, and chainId are required" },
        { status: 400 }
      )
    }

    const artifact = await getWalletDeployArtifact(artifactId)
    if (!artifact) {
      return NextResponse.json({ error: "Deployment artifact not found or expired" }, { status: 404 })
    }

    const viemChain = getChainById(chainId)
    if (!viemChain) {
      return NextResponse.json({ error: `Chain ${chainId} not found` }, { status: 400 })
    }

    const cid = await ipfsUploadDir(artifact.sources, artifact.abi, artifact.bytecode, artifact.standardJsonInput)
    if (!cid) {
      return NextResponse.json({ error: "Failed to upload contract artifacts to IPFS" }, { status: 500 })
    }

    const session = await auth()
    const userId = session?.user?.id || "anon"
    const explorerUrl = getExplorerUrl({
      viemChain,
      hash: contractAddress,
      type: "address",
    })
    const ipfsUrl = getIpfsUrl(cid)

    const verifyContractConfig: VerifyContractParams = {
      deployHash,
      contractAddress,
      standardJsonInput: artifact.standardJsonInput,
      encodedConstructorArgs,
      fileName: getContractFileName(artifact.contractName),
      contractName: artifact.contractName,
      viemChain: {
        id: viemChain.id,
        name: viemChain.name,
        nativeCurrency: viemChain.nativeCurrency,
        rpcUrls: viemChain.rpcUrls,
        blockExplorers: viemChain.blockExplorers,
      },
    }

    await Promise.all([
      storeDeployment(
        {
          chainId,
          cid,
          contractAddress,
          contractName: artifact.contractName,
          deployerAddress,
          deployHash,
        },
        userId
      ),
      storeVerification(verifyContractConfig),
    ])

    await deleteWalletDeployArtifact(artifactId)
    Promise.resolve(
      track("deployed_contract", {
        contractName: artifact.contractName,
        contractAddress,
        explorerUrl,
      })
    ).catch(() => undefined)

    return NextResponse.json({
      explorerUrl,
      ipfsUrl,
      verifyContractConfig,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to finalize wallet deployment" },
      { status: 500 }
    )
  }
}
