import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db, products } from "@/lib/db"
import { eq, and, sum, count } from "drizzle-orm"
import { cache, cacheKeys, cacheTTL } from "@/lib/cache"
import { getStorefrontByUser } from "@/lib/db/storefront-helpers"

// GET /api/products/stats
//
// PERF: Stats are aggregations over the entire products table for a storefront.
// Each call previously fired 4 DB queries (storefront lookup + 3 aggregates).
// At dashboard load this fires for every seller. Wrapped in a 30s in-memory
// cache keyed by storefrontId — the dashboard polls/refetches frequently
// enough that 30s feels live, but within a warm Node instance the cache
// absorbs ~95% of repeat requests.
export async function GET(_req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = session.user.id as string

    const storefront = await getStorefrontByUser(userId)
    if (!storefront) {
      return NextResponse.json({
        totalProducts: 0,
        activeProducts: 0,
        totalDownloads: 0,
        totalViews: 0,
      })
    }

    const stats = await cache.getOrSet(
      cacheKeys.productStats(storefront.id),
      async () => {
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

        return {
          totalProducts: Number(all[0]?.count ?? 0),
          activeProducts: Number(active[0]?.count ?? 0),
          totalDownloads: Number(aggregates[0]?.totalDownloads ?? 0),
          totalViews: Number(aggregates[0]?.totalViews ?? 0),
        }
      },
      { ttl: cacheTTL.short, tags: ["products", `storefront:${storefront.id}`] },
    )

    return NextResponse.json(stats)
  } catch (error) {
    console.error("GET /api/products/stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
