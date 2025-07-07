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

  const combinedDeployments = [...(allDeployments || []), ...(userDeployments || [])]

  return <ContractsDashboard userDeployments={userDeployments || []} allDeployments={combinedDeployments} />
}
