import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db, orders } from "@/lib/db"
import { eq, and, sum, count, gte, lt } from "drizzle-orm"
import { startOfMonth, subMonths } from "date-fns"
import { cache, cacheKeys, cacheTTL } from "@/lib/cache"

// GET /api/sales/stats
//
// PERF: 4 aggregation queries per request, hit on every dashboard load. Cached
// for 30s in-memory. Same warm-instance reasoning as /api/products/stats.
export async function GET(_req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = session.user.id as string

    const result = await cache.getOrSet(
      cacheKeys.salesStats(userId),
      async () => computeSalesStats(userId),
      { ttl: cacheTTL.short, tags: ["sales", `user:${userId}`] },
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error("GET /api/sales/stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function computeSalesStats(userId: string) {
  const now = new Date()
  const thisMonthStart = startOfMonth(now)
  const lastMonthStart = startOfMonth(subMonths(now, 1))

  const [allOrders, completedOrders, thisMonthOrders, lastMonthOrders] = await Promise.all([
      // All orders: total count and sum of subtotals
      db
        .select({ total: count(), totalRevenue: sum(orders.subtotal) })
        .from(orders)
        .where(eq(orders.sellerId, userId)),

      // Completed orders only
      db
        .select({ total: count(), totalRevenue: sum(orders.subtotal) })
        .from(orders)
        .where(and(eq(orders.sellerId, userId), eq(orders.status, "completed"))),

      // This month's completed orders
      db
        .select({ total: count(), totalRevenue: sum(orders.subtotal) })
        .from(orders)
        .where(
          and(
            eq(orders.sellerId, userId),
            eq(orders.status, "completed"),
            gte(orders.createdAt, thisMonthStart)
          )
        ),

      // Last month's completed orders
      db
        .select({ total: count(), totalRevenue: sum(orders.subtotal) })
        .from(orders)
        .where(
          and(
            eq(orders.sellerId, userId),
            eq(orders.status, "completed"),
            gte(orders.createdAt, lastMonthStart),
            lt(orders.createdAt, thisMonthStart)
          )
        ),
    ])

  const totalRevenue = Number(completedOrders[0]?.totalRevenue ?? 0)
  const totalOrders = Number(allOrders[0]?.total ?? 0)
  const completedCount = Number(completedOrders[0]?.total ?? 0)
  const monthlyRevenue = Number(thisMonthOrders[0]?.totalRevenue ?? 0)
  const lastMonthRevenue = Number(lastMonthOrders[0]?.totalRevenue ?? 0)

  // Pending amount = sum of all orders NOT yet completed
  const pendingAmount = Math.max(
    0,
    Number(allOrders[0]?.totalRevenue ?? 0) - totalRevenue
  )

  // Month-over-month change percentage
  const salesChange =
    lastMonthRevenue > 0
      ? (((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1)
      : monthlyRevenue > 0
        ? "100.0"
        : "0.0"

  return {
    totalRevenue,
    totalOrders,
    completedOrders: completedCount,
    pendingAmount,
    monthlyRevenue,
    salesChange,
  }
}
