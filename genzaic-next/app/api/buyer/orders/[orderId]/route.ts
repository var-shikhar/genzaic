import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db, orders, orderItems, storefronts, users } from "@/lib/db"
import { eq } from "drizzle-orm"

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type RouteContext = { params: Promise<{ orderId: string }> }

// GET /api/buyer/orders/[orderId] - single buyer order detail
export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = session.user.id as string

    const { orderId } = await params
    if (!UUID_RE.test(orderId)) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Get buyer's email to verify ownership of guest orders too
    const [user] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1)

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })

    // Verify this order belongs to the authenticated buyer (by userId or email)
    const ownedByUser = order.buyerId === userId || order.buyerEmail === user.email
    if (!ownedByUser) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get order items
    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId))

    const firstItem = items[0] ?? null

    const [seller] = await db
      .select({
        name: users.name,
        storeUrl: storefronts.storeUrl,
        email: users.email,
        storeName: storefronts.storeName,
        contactPhone: storefronts.contactPhone,
        contactWhatsapp: storefronts.contactWhatsapp,
      })
      .from(users)
      .leftJoin(storefronts, eq(storefronts.userId, users.id))
      .where(eq(users.id, order.sellerId))
      .limit(1)

    return NextResponse.json({
      id: order.id,
      orderNumber: order.orderNumber,
      productId: firstItem?.productId ?? null,
      productTitle: firstItem?.productTitle ?? "Unknown",
      productThumbnail: firstItem?.productThumbnail ?? null,
      productDescription: firstItem?.productDescription ?? null,
      sellerName: seller?.name ?? "Unknown",
      sellerStoreUrl: seller?.storeUrl ?? null,
      sellerEmail: seller?.email ?? null,
      sellerPhone: seller?.contactPhone ?? null,
      sellerWhatsapp: seller?.contactWhatsapp ?? null,
      totalAmount: order.totalAmount,
      purchasedAt: order.createdAt,
      downloadCount: firstItem?.downloadCount ?? 0,
      maxDownloads: firstItem?.maxDownloads ?? 5,
      downloadLink: firstItem?.downloadLink ?? null,
      deliveryType: firstItem?.deliveryType ?? "download",
      externalUrl: firstItem?.externalUrl ?? null,
      deliveryStatus: firstItem?.deliveryStatus ?? null,
      items,
    })
  } catch (error) {
    console.error("GET /api/buyer/orders/[orderId] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
