import { NextRequest, NextResponse } from "next/server"
import { db, products, storefronts, users } from "@/lib/db"
import { eq, and } from "drizzle-orm"

type RouteContext = { params: Promise<{ productId: string }> }

// GET /api/checkout/product/[productId] - public product info for checkout (no auth required)
export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { productId } = await params

    const [product] = await db
      .select()
      .from(products)
      .where(and(eq(products.id, productId), eq(products.isActive, true)))
      .limit(1)

    if (!product) {
      return NextResponse.json({ error: "Product not found or is not available" }, { status: 404 })
    }

    // Get storefront and seller info
    const [storefront] = await db
      .select()
      .from(storefronts)
      .where(eq(storefronts.id, product.storefrontId))
      .limit(1)

    if (!storefront) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const [seller] = await db
      .select({
        id: users.id,
        name: users.name,
        avatarUrl: users.avatarUrl,
        storeUrl: users.storeUrl,
      })
      .from(users)
      .where(eq(users.id, storefront.userId))
      .limit(1)

    return NextResponse.json({
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice,
      thumbnailUrl: product.thumbnailUrl,
      deliveryType: product.deliveryType,
      seller: {
        id: seller?.id,
        name: seller?.name,
        avatarUrl: seller?.avatarUrl,
        storeUrl: seller?.storeUrl,
        storeName: storefront.storeName,
      },
      platformFeeMode: storefront.platformFeeMode,
    })
  } catch (error) {
    console.error("GET /api/checkout/product/[productId] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
