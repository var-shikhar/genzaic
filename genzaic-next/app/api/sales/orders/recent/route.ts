import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db, orders } from "@/lib/db"
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
        productTitle: orders.productTitle,
        productThumbnail: orders.productThumbnail,
        buyerName: orders.buyerName,
        buyerEmail: orders.buyerEmail,
        buyerPhone: orders.buyerPhone,
        amount: orders.amount,
        gstAmount: orders.gstAmount,
        totalAmount: orders.totalAmount,
        status: orders.status,
        deliveryType: orders.deliveryType,
        deliveryStatus: orders.deliveryStatus,
        paymentMethod: orders.paymentMethod,
        downloadCount: orders.downloadCount,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .where(eq(orders.sellerId, userId))
      .orderBy(desc(orders.createdAt))
      .limit(5)

    return NextResponse.json(recentOrders)
  } catch (error) {
    console.error("GET /api/sales/orders/recent error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
