import { NextRequest, NextResponse } from "next/server"
import { getPublicStorefrontProduct } from "@/lib/data/public-storefront"
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
// - The underlying loader has a 2-minute in-memory cache shared with the
//   SSR page at `/store/[slug]/product/[productId]`. Invalidated from
//   the seller-side mutations in /api/products/*. See
//   `invalidatePublicStorefrontBySlug` which wipes this prefix too.
// - `Cache-Control: s-maxage=60, stale-while-revalidate=300` for edge caching.
export async function GET(req: NextRequest, { params }: RouteContext) {
  const limited = enforceRateLimit(req, "public-product", { max: 60, windowSec: 60 })
  if (limited) return limited

  try {
    const { slug, productId } = await params
    const result = await getPublicStorefrontProduct(slug, productId)

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
