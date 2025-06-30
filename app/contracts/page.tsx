import { auth } from "@/auth"
import { ContractsDashboard } from "@/components/contracts-dashboard"
import { getAllDeployments, getUserDeployments } from "@/lib/data/kv"

export default async function ContractsPage() {
  const session = await auth()
  const userId = session?.user?.id

  const [userDeployments, allDeployments] = await Promise.all([
    userId ? getUserDeployments() : Promise.resolve([]),
    getAllDeployments(),
  ])

  return <ContractsDashboard userDeployments={userDeployments || []} allDeployments={allDeployments || []} />
}
