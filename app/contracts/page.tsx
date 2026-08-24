import { ContractsDashboard } from "@/components/contracts-dashboard"
import { getSession } from "@/lib/auth"
import { getAllDeployments, getUserDeployments } from "@/lib/data/kv"
import { parseDeploymentChainFilter } from "@/lib/deployment-analytics"

type ContractsPageProps = {
  searchParams: Promise<{ chain?: string | string[] }>
}

export default async function ContractsPage({ searchParams }: ContractsPageProps) {
  const session = await getSession()
  const userId = session?.user?.id
  const { chain } = await searchParams
  const initialChainId = parseDeploymentChainFilter(chain)

  const [userDeployments, allDeployments] = await Promise.all([
    userId ? getUserDeployments() : Promise.resolve([]),
    getAllDeployments(),
  ])

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <ContractsDashboard
        allDeployments={allDeployments || []}
        initialChainId={initialChainId}
        userDeployments={userDeployments || []}
      />
    </div>
  )
}
