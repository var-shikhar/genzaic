import { NextRequest, NextResponse } from "next/server"
import { db, storefronts, products, users } from "@/lib/db"
import { eq, and } from "drizzle-orm"
import { cache, cacheKeys, cacheTTL } from "@/lib/cache"
import { enforceRateLimit } from "@/lib/rate-limit"

type RouteContext = { params: Promise<{ slug: string; productId: string }> }

// GET /api/storefront/public/[slug]/products/[productId]
//
// Public product detail — no auth, hit by anonymous traffic right after a
// storefront visit. High leverage for caching because crawlers and buyers
// often hit the same product repeatedly.
//
// PERF:
// - 60 reads per IP per minute (rate-limited).
// - 2-minute in-memory cache keyed on slug + productId. Invalidated from
//   the seller-side mutations in /api/products/*. See
//   `invalidatePublicStorefrontBySlug` which wipes this prefix too.
// - `Cache-Control: s-maxage=60, stale-while-revalidate=300` for edge caching.
export async function GET(req: NextRequest, { params }: RouteContext) {
  const limited = enforceRateLimit(req, "public-product", { max: 60, windowSec: 60 })
  if (limited) return limited

  try {
    const { slug, productId } = await params

    const result = await cache.getOrSet(
      cacheKeys.publicStorefrontProduct(slug, productId),
      async () => {
        // Find the published storefront
        const [storefront] = await db
          .select()
          .from(storefronts)
          .where(eq(storefronts.storeUrl, slug))
          .limit(1)

        if (!storefront) return { kind: "not_found" as const }
        if (!storefront.isPublished) return { kind: "not_found" as const }

        // Fetch the product and seller in parallel.
        const [productRows, sellerRows] = await Promise.all([
          db
            .select()
            .from(products)
            .where(
              and(
                eq(products.id, productId),
                eq(products.storefrontId, storefront.id),
                eq(products.isActive, true),
              ),
            )
            .limit(1),
          db
            .select({
              id: users.id,
              name: users.name,
              avatarUrl: users.avatarUrl,
              storeUrl: storefronts.storeUrl,
              totalSales: users.totalSales,
            })
            .from(users)
            .leftJoin(storefronts, eq(storefronts.userId, users.id))
            .where(eq(users.id, storefront.userId))
            .limit(1),
        ])

        const product = productRows[0]
        if (!product) return { kind: "product_not_found" as const }

        return {
          kind: "ok" as const,
          payload: {
            product,
            storefront: {
              storeName: storefront.storeName,
              storeUrl: storefront.storeUrl,
              themeId: storefront.themeId,
              primaryColor: storefront.primaryColor,
            },
            seller: sellerRows[0] ?? null,
          },
        }
      },
      { ttl: cacheTTL.medium, tags: ["public-storefront", `slug:${slug}`] },
    )

    if (result.kind === "not_found") {
      return NextResponse.json({ error: "Storefront not found" }, { status: 404 })
    }
    if (result.kind === "product_not_found") {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(result.payload, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    })
  } catch (error) {
    console.error("GET /api/storefront/public/[slug]/products/[productId] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
