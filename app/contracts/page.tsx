import { ContractsDashboard } from "@/components/contracts-dashboard"
import { getSession } from "@/lib/auth"
import { getAllDeployments, getUserDeployments } from "@/lib/data/kv"

export default async function ContractsPage() {
  const session = await getSession()
  const userId = session?.user?.id

  const [userDeployments, allDeployments] = await Promise.all([
    userId ? getUserDeployments() : Promise.resolve([]),
    getAllDeployments(),
  ])

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <ContractsDashboard allDeployments={allDeployments || []} userDeployments={userDeployments || []} />
    </div>
  )
}
