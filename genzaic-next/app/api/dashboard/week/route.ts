import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { orders, orderItems } from "@/lib/db/schema/commerce"
import { products } from "@/lib/db/schema/catalog"
import { and, desc, eq, gte, sql } from "drizzle-orm"
import { getStorefrontByUser } from "@/lib/db/storefront-helpers"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = session.user.id as string
  const since = new Date()
  since.setDate(since.getDate() - 6)
  since.setHours(0, 0, 0, 0)

  const sf = await getStorefrontByUser(userId)
  const sfId = sf?.id

  // sales = ALL orders for this seller in the window, any status. Pending
  // orders still represent activity worth surfacing on the strip — the
  // status badge on each row tells the seller what stage each one is at.
  const dailySales = await db
    .select({
      day: sql<string>`to_char(${orders.createdAt}, 'YYYY-MM-DD')`,
      count: sql<number>`count(*)::int`,
    })
    .from(orders)
    .where(and(
      eq(orders.sellerId, userId),
      gte(orders.createdAt, since),
    ))
    .groupBy(sql`to_char(${orders.createdAt}, 'YYYY-MM-DD')`)

  // drops = products created in this storefront in window
  const dailyDrops = sfId
    ? await db
        .select({
          day: sql<string>`to_char(${products.createdAt}, 'YYYY-MM-DD')`,
          count: sql<number>`count(*)::int`,
        })
        .from(products)
        .where(and(eq(products.storefrontId, sfId), gte(products.createdAt, since)))
        .groupBy(sql`to_char(${products.createdAt}, 'YYYY-MM-DD')`)
    : []

  const daysMap = new Map<string, { sales: number; drops: number }>()
  for (const r of dailySales) daysMap.set(r.day, { sales: r.count, drops: 0 })
  for (const r of dailyDrops) {
    const e = daysMap.get(r.day) ?? { sales: 0, drops: 0 }
    e.drops = r.count
    daysMap.set(r.day, e)
  }

  const days: Array<{ date: string; sales: number; drops: number }> = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    days.push({ date: key, ...(daysMap.get(key) ?? { sales: 0, drops: 0 }) })
  }

  // Also surface the actual orders for the same 7-day window so the
  // dashboard strip can render a per-day activity list inline. We pull
  // the first order-item per order in a single grouped query to avoid
  // an N+1 in the loop.
  const ordersInWindow = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      buyerName: orders.buyerName,
      totalAmount: orders.totalAmount,
      status: orders.status,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(and(
      eq(orders.sellerId, userId),
      gte(orders.createdAt, since),
    ))
    .orderBy(desc(orders.createdAt))
    .limit(50)

  const orderIds = ordersInWindow.map((o) => o.id)
  const itemRows = orderIds.length > 0
    ? await db
        .select({
          orderId: orderItems.orderId,
          productTitle: orderItems.productTitle,
          productThumbnail: orderItems.productThumbnail,
        })
        .from(orderItems)
        .where(sql`${orderItems.orderId} IN (${sql.join(orderIds.map((id) => sql`${id}`), sql`, `)})`)
    : []

  // Pick the first item per order. Multi-item orders aren't a thing yet,
  // but if they appear we just show the first as a representative title.
  const itemsByOrder = new Map<string, { productTitle: string; productThumbnail: string | null }>()
  for (const it of itemRows) {
    if (!itemsByOrder.has(it.orderId)) {
      itemsByOrder.set(it.orderId, {
        productTitle: it.productTitle,
        productThumbnail: it.productThumbnail,
      })
    }
  }

  const ordersPayload = ordersInWindow.map((o) => {
    const item = itemsByOrder.get(o.id)
    return {
      id: o.id,
      orderNumber: o.orderNumber,
      productTitle: item?.productTitle ?? "—",
      productThumbnail: item?.productThumbnail ?? null,
      buyerName: o.buyerName,
      totalAmount: o.totalAmount,
      createdAt: o.createdAt,
    }
  })

  return NextResponse.json({ days, orders: ordersPayload })
}
