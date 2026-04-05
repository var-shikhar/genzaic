import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db, orders, downloadLogs } from "@/lib/db"
import { eq, and, desc } from "drizzle-orm"

type RouteContext = { params: Promise<{ id: string }> }

// GET /api/sales/orders/[id] - single order detail for the seller
export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = session.user.id as string

    const { id } = await params

    const [order] = await db
      .select()
      .from(orders)
      .where(and(eq(orders.id, id), eq(orders.sellerId, userId)))
      .limit(1)

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })

    // Fetch download logs for this order
    const logs = await db
      .select()
      .from(downloadLogs)
      .where(eq(downloadLogs.orderId, id))
      .orderBy(desc(downloadLogs.downloadedAt))

    return NextResponse.json({ ...order, downloadLogs: logs })
  } catch (error) {
    console.error("GET /api/sales/orders/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
