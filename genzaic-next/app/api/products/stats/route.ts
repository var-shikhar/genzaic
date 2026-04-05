import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db, storefronts, products } from "@/lib/db"
import { eq, and, sum, count } from "drizzle-orm"

// GET /api/products/stats
export async function GET(_req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = session.user.id as string

    const [storefront] = await db
      .select({ id: storefronts.id })
      .from(storefronts)
      .where(eq(storefronts.userId, userId))
      .limit(1)

    if (!storefront) {
      return NextResponse.json({
        totalProducts: 0,
        activeProducts: 0,
        totalDownloads: 0,
        totalViews: 0,
      })
    }

    const [all, active, aggregates] = await Promise.all([
      db
        .select({ count: count() })
        .from(products)
        .where(eq(products.storefrontId, storefront.id)),
      db
        .select({ count: count() })
        .from(products)
        .where(and(eq(products.storefrontId, storefront.id), eq(products.isActive, true))),
      db
        .select({
          totalDownloads: sum(products.downloads),
          totalViews: sum(products.views),
        })
        .from(products)
        .where(eq(products.storefrontId, storefront.id)),
    ])

    return NextResponse.json({
      totalProducts: Number(all[0]?.count ?? 0),
      activeProducts: Number(active[0]?.count ?? 0),
      totalDownloads: Number(aggregates[0]?.totalDownloads ?? 0),
      totalViews: Number(aggregates[0]?.totalViews ?? 0),
    })
  } catch (error) {
    console.error("GET /api/products/stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
