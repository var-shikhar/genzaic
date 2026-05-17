import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getPayoutsForUser } from "@/lib/data/payouts"

// GET /api/payouts — thin wrapper around the shared helper.
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = session.user.id as string

    const { searchParams } = new URL(req.url)
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"))
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "10")))
    const status = searchParams.get("status") ?? undefined

    const result = await getPayoutsForUser(userId, { page, limit, status })

    return NextResponse.json({
      payouts: result.payouts,
      total: result.total,
      page,
      limit,
    })
  } catch (error) {
    console.error("GET /api/payouts error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
