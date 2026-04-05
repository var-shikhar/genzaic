import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db, payouts } from "@/lib/db"
import { eq, and, desc, count } from "drizzle-orm"

// GET /api/payouts - paginated payout list for the user
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = session.user.id as string

    const { searchParams } = new URL(req.url)
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"))
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "10")))
    const offset = (page - 1) * limit
    const status = searchParams.get("status") ?? ""

    const conditions = [eq(payouts.userId, userId)]
    if (status && ["pending", "processing", "completed", "failed"].includes(status)) {
      conditions.push(eq(payouts.status, status as "pending" | "processing" | "completed" | "failed"))
    }
    const whereClause = and(...conditions)

    const [totalResult, rows] = await Promise.all([
      db.select({ count: count() }).from(payouts).where(whereClause),
      db
        .select()
        .from(payouts)
        .where(whereClause)
        .orderBy(desc(payouts.createdAt))
        .limit(limit)
        .offset(offset),
    ])

    return NextResponse.json({
      payouts: rows,
      total: Number(totalResult[0]?.count ?? 0),
      page,
      limit,
    })
  } catch (error) {
    console.error("GET /api/payouts error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
