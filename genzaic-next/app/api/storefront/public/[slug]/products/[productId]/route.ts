import { NextRequest, NextResponse } from "next/server"
import { db, storefronts, products, users } from "@/lib/db"
import { eq, and } from "drizzle-orm"

type RouteContext = { params: Promise<{ slug: string; productId: string }> }

// GET /api/storefront/public/[slug]/products/[productId]
// Public product detail page — no auth required
export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { slug, productId } = await params

    // Find the published storefront
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

    // Find the active product that belongs to this storefront
    const [product] = await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.id, productId),
          eq(products.storefrontId, storefront.id),
          eq(products.isActive, true)
        )
      )
      .limit(1)

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Get seller info
    const [seller] = await db
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
      .limit(1)

    return NextResponse.json({
      product,
      storefront: {
        storeName: storefront.storeName,
        storeUrl: storefront.storeUrl,
        themeId: storefront.themeId,
        primaryColor: storefront.primaryColor,
      },
      seller,
    })
  } catch (error) {
    console.error("GET /api/storefront/public/[slug]/products/[productId] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
