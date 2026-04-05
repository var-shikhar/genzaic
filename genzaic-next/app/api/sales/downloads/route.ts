import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db, orders, downloadLogs } from "@/lib/db"
import { eq, desc, count, inArray } from "drizzle-orm"

// GET /api/sales/downloads - download logs for all of the seller's orders
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = session.user.id as string

    const { searchParams } = new URL(req.url)
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"))
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "10")))
    const offset = (page - 1) * limit

    // Get all order IDs for this seller
    const sellerOrders = await db
      .select({ id: orders.id })
      .from(orders)
      .where(eq(orders.sellerId, userId))

    if (sellerOrders.length === 0) {
      return NextResponse.json({ logs: [], total: 0, page, limit })
    }

    const orderIds = sellerOrders.map((o) => o.id)

    const whereClause = inArray(downloadLogs.orderId, orderIds)

    const [totalResult, logs] = await Promise.all([
      db.select({ count: count() }).from(downloadLogs).where(whereClause),
      db
        .select({
          id: downloadLogs.id,
          orderId: downloadLogs.orderId,
          productTitle: downloadLogs.productTitle,
          buyerName: downloadLogs.buyerName,
          buyerEmail: downloadLogs.buyerEmail,
          ipAddress: downloadLogs.ipAddress,
          downloadedAt: downloadLogs.downloadedAt,
        })
        .from(downloadLogs)
        .where(whereClause)
        .orderBy(desc(downloadLogs.downloadedAt))
        .limit(limit)
        .offset(offset),
    ])

    return NextResponse.json({
      logs,
      total: Number(totalResult[0]?.count ?? 0),
      page,
      limit,
    })
  } catch (error) {
    console.error("GET /api/sales/downloads error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
