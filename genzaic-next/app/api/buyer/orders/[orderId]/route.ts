import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db, orders, storefronts, users } from "@/lib/db"
import { eq } from "drizzle-orm"

type RouteContext = { params: Promise<{ orderId: string }> }

// GET /api/buyer/orders/[orderId] - single buyer order detail
export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = session.user.id as string

    const { orderId } = await params

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

    const [seller] = await db
      .select({
        name: users.name,
        storeUrl: users.storeUrl,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, order.sellerId))
      .limit(1)

    const [storefront] = await db
      .select({
        storeName: storefronts.storeName,
        contactPhone: storefronts.contactPhone,
        contactWhatsapp: storefronts.contactWhatsapp,
      })
      .from(storefronts)
      .where(eq(storefronts.userId, order.sellerId))
      .limit(1)

    return NextResponse.json({
      id: order.id,
      productId: order.productId,
      productTitle: order.productTitle,
      productThumbnail: order.productThumbnail,
      productDescription: order.productDescription,
      sellerName: seller?.name ?? "Unknown",
      sellerStoreUrl: seller?.storeUrl ?? null,
      sellerEmail: seller?.email ?? null,
      sellerPhone: storefront?.contactPhone ?? null,
      sellerWhatsapp: storefront?.contactWhatsapp ?? null,
      totalAmount: order.totalAmount,
      purchasedAt: order.createdAt,
      downloadCount: order.downloadCount,
      maxDownloads: order.maxDownloads,
      downloadLink: order.downloadLink,
      deliveryType: order.deliveryType,
      externalUrl: order.externalUrl,
      deliveryStatus: order.deliveryStatus,
    })
  } catch (error) {
    console.error("GET /api/buyer/orders/[orderId] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
