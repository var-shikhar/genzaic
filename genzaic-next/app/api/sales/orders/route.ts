import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getOrdersForUser } from "@/lib/data/sales"

// GET /api/sales/orders — thin wrapper around getOrdersForUser. Same helper
// is used by the dashboard/sales RSC prefetch so the cache contract lives in
// one place.
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = session.user.id as string

    const { searchParams } = new URL(req.url)
    const result = await getOrdersForUser(userId, {
      page: Number(searchParams.get("page") ?? "1"),
      limit: Number(searchParams.get("limit") ?? "10"),
      status: searchParams.get("status") ?? undefined,
      search: searchParams.get("search") ?? undefined,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("GET /api/sales/orders error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
