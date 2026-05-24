import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getSalesStatsForUser } from "@/lib/data/dashboard"

// GET /api/sales/stats
//
// Thin HTTP wrapper around getSalesStatsForUser — the same helper that the
// dashboard RSC uses for its server-side prefetch. Cache lives in the helper.
export async function GET(_req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = session.user.id as string

    const result = await getSalesStatsForUser(userId)
    return NextResponse.json(result)
  } catch (error) {
    console.error("GET /api/sales/stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
