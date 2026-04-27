import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db, orders, orderItems } from "@/lib/db"
import { eq, and, desc, ilike, or, count, inArray } from "drizzle-orm"

// GET /api/sales/orders - paginated order list for the seller
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = session.user.id as string

    const { searchParams } = new URL(req.url)
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"))
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "10")))
    const offset = (page - 1) * limit
    const search = searchParams.get("search") ?? ""
    const status = searchParams.get("status") ?? ""

    const conditions = [eq(orders.sellerId, userId)]

    if (status && ["pending", "completed", "refunded"].includes(status)) {
      conditions.push(eq(orders.status, status as "pending" | "completed"))
    }

    if (search) {
      conditions.push(
        or(
          ilike(orders.buyerName, `%${search}%`),
          ilike(orders.buyerEmail, `%${search}%`)
        )!
      )
    }

    const whereClause = and(...conditions)

    const [totalResult, rows] = await Promise.all([
      db.select({ count: count() }).from(orders).where(whereClause),
      db
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
        .where(whereClause)
        .orderBy(desc(orders.createdAt))
        .limit(limit)
        .offset(offset),
    ])

    // PERF: Batch-fetch all order items for the page in ONE query instead of
    // firing one per order. At limit=100 this drops from 101 round-trips to 1.
    const orderIdsInPage = rows.map((r) => r.id)
    const itemsForPage = orderIdsInPage.length
      ? await db
          .select({
            orderId: orderItems.orderId,
            productTitle: orderItems.productTitle,
            productThumbnail: orderItems.productThumbnail,
            deliveryType: orderItems.deliveryType,
            deliveryStatus: orderItems.deliveryStatus,
            downloadCount: orderItems.downloadCount,
          })
          .from(orderItems)
          .where(inArray(orderItems.orderId, orderIdsInPage))
      : []

    // Group items by orderId, keeping only the first item per order to match
    // the existing single-product-per-row UX.
    const firstItemByOrderId = new Map<string, (typeof itemsForPage)[number]>()
    for (const item of itemsForPage) {
      if (!firstItemByOrderId.has(item.orderId)) {
        firstItemByOrderId.set(item.orderId, item)
      }
    }

    const enrichedRows = rows.map((row) => {
      const firstItem = firstItemByOrderId.get(row.id) ?? null
      return {
        ...row,
        productTitle: firstItem?.productTitle ?? "Unknown",
        productThumbnail: firstItem?.productThumbnail ?? null,
        deliveryType: firstItem?.deliveryType ?? "download",
        deliveryStatus: firstItem?.deliveryStatus ?? null,
        downloadCount: firstItem?.downloadCount ?? 0,
      }
    })

    return NextResponse.json({
      orders: enrichedRows,
      total: Number(totalResult[0]?.count ?? 0),
      page,
      limit,
    })
  } catch (error) {
    console.error("GET /api/sales/orders error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
