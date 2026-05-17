import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getRecentOrdersForUser } from "@/lib/data/sales"

// GET /api/sales/orders/recent — thin wrapper. Shared helper with the
// dashboard/sales RSC prefetch.
export async function GET(_req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = session.user.id as string

    const rows = await getRecentOrdersForUser(userId)
    return NextResponse.json(rows)
  } catch (error) {
    console.error("GET /api/sales/orders/recent error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
