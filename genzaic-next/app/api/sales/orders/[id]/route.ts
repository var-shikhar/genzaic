import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db, orders, orderItems, downloadLogs } from "@/lib/db"
import { eq, and, desc, inArray } from "drizzle-orm"

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type RouteContext = { params: Promise<{ id: string }> }

// GET /api/sales/orders/[id] - single order detail for the seller
export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = session.user.id as string

    const { id } = await params
    if (!UUID_RE.test(id)) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const [order] = await db
      .select()
      .from(orders)
      .where(and(eq(orders.id, id), eq(orders.sellerId, userId)))
      .limit(1)

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })

    // Fetch order items
    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, id))

    // Fetch download logs for all order items
    const itemIds = items.map((item) => item.id)
    const logs = itemIds.length
      ? await db
          .select()
          .from(downloadLogs)
          .where(inArray(downloadLogs.orderItemId, itemIds))
          .orderBy(desc(downloadLogs.downloadedAt))
      : []

    return NextResponse.json({ ...order, items, downloadLogs: logs })
  } catch (error) {
    console.error("GET /api/sales/orders/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
