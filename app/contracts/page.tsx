import { auth } from "@/auth"
import { ContractsDashboard } from "@/components/contracts-dashboard"
import { getAllDeployments, getUserDeployments } from "@/lib/data/kv"
import { redirect } from "next/navigation"

export default async function ContractsPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/sign-in?next=/contracts")
  }

  const [userDeployments, allDeployments] = await Promise.all([getUserDeployments(), getAllDeployments()])

  return <ContractsDashboard userDeployments={userDeployments || []} allDeployments={allDeployments || []} />
}
