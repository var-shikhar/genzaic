import { NextRequest, NextResponse } from "next/server"
import { db, orders, orderItems } from "@/lib/db"
import { eq } from "drizzle-orm"

type RouteContext = { params: Promise<{ orderId: string }> }

// GET /api/checkout/order/[orderId] - order info for the download page (public, by orderId)
export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { orderId } = await params

    const [order] = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        buyerName: orders.buyerName,
        buyerEmail: orders.buyerEmail,
        totalAmount: orders.totalAmount,
        status: orders.status,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1)

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })

    // Get first order item for product-level info
    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId))

    const firstItem = items[0] ?? null

    return NextResponse.json({
      id: order.id,
      orderNumber: order.orderNumber,
      productTitle: firstItem?.productTitle ?? "Unknown",
      productThumbnail: firstItem?.productThumbnail ?? null,
      buyerName: order.buyerName,
      buyerEmail: order.buyerEmail,
      totalAmount: order.totalAmount,
      status: order.status,
      deliveryType: firstItem?.deliveryType ?? "download",
      downloadLink: firstItem?.downloadLink ?? null,
      externalUrl: firstItem?.externalUrl ?? null,
      downloadCount: firstItem?.downloadCount ?? 0,
      maxDownloads: firstItem?.maxDownloads ?? 5,
      createdAt: order.createdAt,
    })
  } catch (error) {
    console.error("GET /api/checkout/order/[orderId] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
