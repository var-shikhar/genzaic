import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { orders } from "@/lib/db/schema/commerce"
import { products } from "@/lib/db/schema/catalog"
import { storefronts } from "@/lib/db/schema/storefronts"
import { and, eq, gte, sql } from "drizzle-orm"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = session.user.id as string
  const since = new Date()
  since.setDate(since.getDate() - 6)
  since.setHours(0, 0, 0, 0)

  const sf = await db
    .select({ id: storefronts.id })
    .from(storefronts)
    .where(eq(storefronts.userId, userId))
    .limit(1)
  const sfId = sf[0]?.id

  // sales = orders with this seller, completed
  const dailySales = await db
    .select({
      day: sql<string>`to_char(${orders.createdAt}, 'YYYY-MM-DD')`,
      count: sql<number>`count(*)::int`,
    })
    .from(orders)
    .where(and(
      eq(orders.sellerId, userId),
      eq(orders.status, "completed"),
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

  const daysMap = new Map<string, { sales: number; views: number; drops: number }>()
  for (const r of dailySales) daysMap.set(r.day, { sales: r.count, views: 0, drops: 0 })
  for (const r of dailyDrops) {
    const e = daysMap.get(r.day) ?? { sales: 0, views: 0, drops: 0 }
    e.drops = r.count
    daysMap.set(r.day, e)
  }

  const days: Array<{ date: string; sales: number; views: number; drops: number }> = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    days.push({ date: key, ...(daysMap.get(key) ?? { sales: 0, views: 0, drops: 0 }) })
  }

  return NextResponse.json({ days })
}
