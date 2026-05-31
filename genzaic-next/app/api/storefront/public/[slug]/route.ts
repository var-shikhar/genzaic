import { NextRequest, NextResponse } from "next/server"
import { getPublicStorefront } from "@/lib/data/public-storefront"
import { enforceRateLimit } from "@/lib/rate-limit"

type RouteContext = { params: Promise<{ slug: string }> }

// GET /api/storefront/public/[slug]
//
// Public storefront with active products. No auth required, hit by anonymous
// traffic and crawlers — by far the most exposed read endpoint.
//
// PERF: Delegates to `getPublicStorefront()` which wraps the underlying
// queries in a 2-minute in-memory cache. The same loader is also called by
// the SSR page at /store/[storeUrl] so cache hits stack across both
// surfaces. Sets `Cache-Control: s-maxage=60, stale-while-revalidate=300`
// so the Vercel edge / any CDN in front can also cache, eliminating the
// instance hop entirely for repeat visitors within the window.
export async function GET(req: NextRequest, { params }: RouteContext) {
  // 60 reads per IP per minute. Anonymous endpoint, most exposed surface.
  const limited = await enforceRateLimit(req, "public-storefront", { max: 60, windowSec: 60 })
  if (limited) return limited

  try {
    const { slug } = await params

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 })
    }

    const result = await getPublicStorefront(slug)

    if (result.kind === "not_found") {
      return NextResponse.json({ error: "Storefront not found" }, { status: 404 })
    }
    if (result.kind === "closed") {
      // The storefront exists but is in the explicit `unpublished` state.
      // Surface the closed-state payload so a public-API caller can render
      // the same closed page the SSR route does.
      return NextResponse.json(
        { kind: "closed", payload: result.payload },
        { status: 200 },
      )
    }

    return NextResponse.json(result.payload, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    })
  } catch (error) {
    console.error("GET /api/storefront/public/[slug] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
