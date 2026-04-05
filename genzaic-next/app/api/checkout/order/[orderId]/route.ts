import { NextRequest, NextResponse } from "next/server"
import { db, orders } from "@/lib/db"
import { eq } from "drizzle-orm"

type RouteContext = { params: Promise<{ orderId: string }> }

// GET /api/checkout/order/[orderId] - order info for the download page (public, by orderId)
export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { orderId } = await params

    const [order] = await db
      .select({
        id: orders.id,
        productTitle: orders.productTitle,
        productThumbnail: orders.productThumbnail,
        buyerName: orders.buyerName,
        buyerEmail: orders.buyerEmail,
        totalAmount: orders.totalAmount,
        status: orders.status,
        deliveryType: orders.deliveryType,
        downloadLink: orders.downloadLink,
        externalUrl: orders.externalUrl,
        downloadCount: orders.downloadCount,
        maxDownloads: orders.maxDownloads,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1)

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })

    return NextResponse.json(order)
  } catch (error) {
    console.error("GET /api/checkout/order/[orderId] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
