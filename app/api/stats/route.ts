import { NextResponse } from "next/server"
import { getAllAgents, getAllDeployments } from "@/lib/data/kv"
import { buildPublicAnalytics } from "@/lib/deployment-analytics"

const CACHE_CONTROL = "public, s-maxage=300, stale-while-revalidate=3600"

export async function GET() {
  const [agents, deployments] = await Promise.all([getAllAgents(), getAllDeployments()])
  const analytics = buildPublicAnalytics({
    customAgentsCreated: agents.length,
    deployments,
    observedAt: new Date().toISOString(),
  })

  return NextResponse.json(analytics, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": CACHE_CONTROL,
    },
  })
}
