import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db, orders, orderItems, storefronts, users } from "@/lib/db"
import { eq, desc, inArray } from "drizzle-orm"

// GET /api/buyer/orders - all orders placed by the authenticated buyer
//
// PERF: This endpoint is hit on every visit to /my-purchases. Previously it
// fired 2 queries per order (seller lookup + items lookup) for an N+1 pattern
// that scaled linearly with the buyer's purchase history. Now it's a flat
// 3 queries regardless of order count: orders → sellers (batched) →
// orderItems (batched). At 50 orders per buyer this drops from 101 → 3
// database round-trips.
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

    // 1. Fetch all orders where buyerEmail matches (for guest orders linked later)
    const buyerOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.buyerEmail, user.email))
      .orderBy(desc(orders.createdAt))

    if (buyerOrders.length === 0) {
      return NextResponse.json([])
    }

    const sellerIds = Array.from(new Set(buyerOrders.map((o) => o.sellerId)))
    const orderIds = buyerOrders.map((o) => o.id)

    // 2. Batch-fetch all sellers + their storefronts in a single query.
    const sellerRows = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        storeUrl: storefronts.storeUrl,
        storeName: storefronts.storeName,
        contactPhone: storefronts.contactPhone,
        contactWhatsapp: storefronts.contactWhatsapp,
      })
      .from(users)
      .leftJoin(storefronts, eq(storefronts.userId, users.id))
      .where(inArray(users.id, sellerIds))

    const sellerById = new Map(sellerRows.map((s) => [s.id, s]))

    // 3. Batch-fetch all order items for these orders in a single query.
    const allItems = await db
      .select()
      .from(orderItems)
      .where(inArray(orderItems.orderId, orderIds))

    // Group items by orderId, keeping only the first item per order to match
    // the original "show one product per order row" UX.
    const firstItemByOrderId = new Map<string, (typeof allItems)[number]>()
    for (const item of allItems) {
      if (!firstItemByOrderId.has(item.orderId)) {
        firstItemByOrderId.set(item.orderId, item)
      }
    }

    // 4. Assemble the response purely in JS — no more DB round-trips.
    const enriched = buyerOrders.map((order) => {
      const seller = sellerById.get(order.sellerId)
      const firstItem = firstItemByOrderId.get(order.id) ?? null

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

    return NextResponse.json(enriched)
  } catch (error) {
    console.error("GET /api/buyer/orders error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
