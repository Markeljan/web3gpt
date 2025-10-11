export const runtime = "edge"

// biome-ignore lint/performance/noBarrelFile: auth routes
export { GET, POST } from "@/auth"
