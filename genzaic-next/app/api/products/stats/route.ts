import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getProductStatsForUser } from "@/lib/data/dashboard"

// GET /api/products/stats
//
// Thin HTTP wrapper around getProductStatsForUser — the same helper that the
// dashboard RSC uses for its server-side prefetch. Keeps the cache contract
// (30s in-memory) in one place.
export async function GET(_req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = session.user.id as string

    const stats = await getProductStatsForUser(userId)
    return NextResponse.json(stats)
  } catch (error) {
    console.error("GET /api/products/stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
