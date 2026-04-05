import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db, storefronts, products, orders } from "@/lib/db"
import { eq, and, sum, count } from "drizzle-orm"

// GET /api/storefront/stats
export async function GET(_req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = session.user.id as string

    const [storefront] = await db
      .select({ id: storefronts.id })
      .from(storefronts)
      .where(eq(storefronts.userId, userId))
      .limit(1)

    if (!storefront) {
      return NextResponse.json({ totalViews: 0, totalRevenue: "0", totalOrders: 0 })
    }

    const [viewsResult, ordersResult] = await Promise.all([
      db
        .select({ totalViews: sum(products.views) })
        .from(products)
        .where(eq(products.storefrontId, storefront.id)),
      db
        .select({
          totalRevenue: sum(orders.amount),
          totalOrders: count(),
        })
        .from(orders)
        .where(and(eq(orders.sellerId, userId), eq(orders.status, "completed"))),
    ])

    return NextResponse.json({
      totalViews: Number(viewsResult[0]?.totalViews ?? 0),
      totalRevenue: ordersResult[0]?.totalRevenue ?? "0",
      totalOrders: Number(ordersResult[0]?.totalOrders ?? 0),
    })
  } catch (error) {
    console.error("GET /api/storefront/stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
