import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db, orders, storefronts, users } from "@/lib/db"
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

    // Fetch all orders where buyerId matches OR buyerEmail matches (for guest orders linked later)
    const buyerOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.buyerEmail, user.email))
      .orderBy(desc(orders.createdAt))

    // Enrich with seller info
    const enriched = await Promise.all(
      buyerOrders.map(async (order) => {
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

        return {
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
        }
      })
    )

    return NextResponse.json(enriched)
  } catch (error) {
    console.error("GET /api/buyer/orders error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
