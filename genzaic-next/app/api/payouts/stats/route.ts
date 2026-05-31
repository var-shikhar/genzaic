import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getPayoutStatsForUser } from "@/lib/data/payouts"

// GET /api/payouts/stats — thin wrapper around the shared helper.
export async function GET(_req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = session.user.id as string

    const stats = await getPayoutStatsForUser(userId)
    return NextResponse.json(stats)
  } catch (error) {
    console.error("GET /api/payouts/stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
