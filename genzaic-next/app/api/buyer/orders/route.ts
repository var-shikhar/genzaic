import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db, orders, orderItems, storefronts, users } from "@/lib/db"
import { eq, desc } from "drizzle-orm"

// GET /api/buyer/orders - all orders placed by the authenticated buyer
export async function GET(_req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = session.user.id as string

    // Get user email for matching guest orders too
    const [user] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    // Fetch all orders where buyerEmail matches (for guest orders linked later)
    const buyerOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.buyerEmail, user.email))
      .orderBy(desc(orders.createdAt))

    // Enrich with seller info and first order item
    const enriched = await Promise.all(
      buyerOrders.map(async (order) => {
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

        const items = await db
          .select()
          .from(orderItems)
          .where(eq(orderItems.orderId, order.id))

        const firstItem = items[0] ?? null

        return {
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
        }
      })
    )

    return NextResponse.json(enriched)
  } catch (error) {
    console.error("GET /api/buyer/orders error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
