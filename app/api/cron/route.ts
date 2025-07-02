import { type NextRequest, NextResponse } from "next/server"

import { processVerifications } from "@/lib/solidity/verification-script"

const CRON_SECRET = process.env.CRON_SECRET

export const GET = async (req: NextRequest) => {
  const token = req.headers.get("Authorization")
  if (!token) {
    return NextResponse.json("Unauthorized", { status: 401 })
  }
  if (token.replace("Bearer ", "") !== CRON_SECRET) {
    return NextResponse.json("Unauthorized", { status: 401 })
  }

  const result = await processVerifications()

  return NextResponse.json(result)
}
