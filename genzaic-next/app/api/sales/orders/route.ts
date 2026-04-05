import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db, orders, orderItems } from "@/lib/db"
import { eq, and, desc, ilike, or, count, sql } from "drizzle-orm"

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

    // Enrich each order with its first item's product info
    const enrichedRows = await Promise.all(
      rows.map(async (row) => {
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
