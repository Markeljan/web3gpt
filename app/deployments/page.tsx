import Link from "next/link"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { getChainById } from "@/lib/config"
import { getUserDeployments } from "@/lib/data/kv"
import { getExplorerUrl } from "@/lib/utils"
import type { Hash } from "viem"

export default async function DeploymentsPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/sign-in?next=/deployments")
  }

  const deployments = await getUserDeployments()

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-8">
      <h1 className="text-2xl font-bold">Your Deployments</h1>
      {deployments && deployments.length > 0 ? (
        <div className="space-y-4">
          {deployments.map((deployment) => {
            const chain = getChainById(Number(deployment.chainId))
            return (
              <div key={deployment.cid} className="rounded-lg border p-4 space-y-1">
                <div className="font-semibold">{deployment.contractName}</div>
                <div className="text-sm text-muted-foreground">Chain: {chain?.name || deployment.chainId}</div>
                <div className="text-sm break-all">
                  Address:{" "}
                  {chain ? (
                    <Link
                      href={getExplorerUrl({ viemChain: chain, hash: deployment.contractAddress, type: "address" })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      {deployment.contractAddress}
                    </Link>
                  ) : (
                    deployment.contractAddress
                  )}
                </div>
                <div className="text-sm break-all">
                  Tx:{" "}
                  {chain ? (
                    <Link
                      href={getExplorerUrl({
                        viemChain: chain,
                        hash: deployment.deployHash as Hash,
                        type: "tx",
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      {deployment.deployHash}
                    </Link>
                  ) : (
                    deployment.deployHash
                  )}
                </div>
                <div className="text-sm break-all">
                  <Link href={deployment.ipfsUrl} target="_blank" rel="noopener noreferrer" className="underline">
                    IPFS
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-muted-foreground">No deployments found.</p>
      )}
    </div>
  )
}
