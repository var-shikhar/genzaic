import { NextRequest, NextResponse } from "next/server"
import { db, storefronts, products, users } from "@/lib/db"
import { eq, and } from "drizzle-orm"

type RouteContext = { params: Promise<{ slug: string }> }

// GET /api/storefront/public/[slug] - public storefront with active products (no auth required)
export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = await params

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 })
    }

    // Find storefront by storeUrl
    const [storefront] = await db
      .select()
      .from(storefronts)
      .where(eq(storefronts.storeUrl, slug))
      .limit(1)

    if (!storefront) {
      return NextResponse.json({ error: "Storefront not found" }, { status: 404 })
    }

    if (!storefront.isPublished) {
      return NextResponse.json({ error: "This storefront is not published" }, { status: 404 })
    }

    // Get the seller info
    const [seller] = await db
      .select({
        id: users.id,
        name: users.name,
        avatarUrl: users.avatarUrl,
        followersCount: users.followersCount,
        totalSales: users.totalSales,
      })
      .from(users)
      .where(eq(users.id, storefront.userId))
      .limit(1)

    // Get active products for this storefront
    const activeProducts = await db
      .select()
      .from(products)
      .where(and(eq(products.storefrontId, storefront.id), eq(products.isActive, true)))
      .orderBy(products.createdAt)

    return NextResponse.json({
      ...storefront,
      seller,
      products: activeProducts,
    })
  } catch (error) {
    console.error("GET /api/storefront/public/[slug] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
