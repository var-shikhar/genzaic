import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db, orders, orderItems } from "@/lib/db"
import { eq, desc } from "drizzle-orm"

// GET /api/sales/orders/recent - most recent 5 orders for the seller
export async function GET(_req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = session.user.id as string

    const recentOrders = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        buyerName: orders.buyerName,
        buyerEmail: orders.buyerEmail,
        buyerPhone: orders.buyerPhone,
        subtotal: orders.subtotal,
        gstAmount: orders.gstAmount,
        totalAmount: orders.totalAmount,
        status: orders.status,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .where(eq(orders.sellerId, userId))
      .orderBy(desc(orders.createdAt))
      .limit(5)

    // Enrich each order with first item's product info
    const enriched = await Promise.all(
      recentOrders.map(async (row) => {
        const items = await db
          .select({
            productTitle: orderItems.productTitle,
            productThumbnail: orderItems.productThumbnail,
            deliveryType: orderItems.deliveryType,
            deliveryStatus: orderItems.deliveryStatus,
            downloadCount: orderItems.downloadCount,
          })
          .from(orderItems)
          .where(eq(orderItems.orderId, row.id))
          .limit(1)

        const firstItem = items[0] ?? null

        return {
          ...row,
          productTitle: firstItem?.productTitle ?? "Unknown",
          productThumbnail: firstItem?.productThumbnail ?? null,
          deliveryType: firstItem?.deliveryType ?? "download",
          deliveryStatus: firstItem?.deliveryStatus ?? null,
          downloadCount: firstItem?.downloadCount ?? 0,
        }
      })
    )

    return NextResponse.json(enriched)
  } catch (error) {
    console.error("GET /api/sales/orders/recent error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
