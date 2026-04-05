import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db, orders } from "@/lib/db"
import { eq, and, desc, ilike, or, count } from "drizzle-orm"

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
      conditions.push(eq(orders.status, status as "pending" | "completed" | "refunded"))
    }

    if (search) {
      conditions.push(
        or(
          ilike(orders.productTitle, `%${search}%`),
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
        .where(whereClause)
        .orderBy(desc(orders.createdAt))
        .limit(limit)
        .offset(offset),
    ])

    return NextResponse.json({
      orders: rows,
      total: Number(totalResult[0]?.count ?? 0),
      page,
      limit,
    })
  } catch (error) {
    console.error("GET /api/sales/orders error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
