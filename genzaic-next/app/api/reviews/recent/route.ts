import { NextRequest, NextResponse } from "next/server"
import { and, desc, eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { reviews } from "@/lib/db/schema/social"
import { products } from "@/lib/db/schema/catalog"
import { users } from "@/lib/db/schema/users"
import { getStorefrontByUser } from "@/lib/db/storefront-helpers"

// GET /api/reviews/recent?limit=3 — dashboard "Reader mail" widget.
// Returns the most recent reviews left on products in the seller's storefront.
// A fresh seller with no products gets an empty list (not a 404).
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const userId = session.user.id as string

  const limitParam = Number(req.nextUrl.searchParams.get("limit") ?? "3")
  const limit = Math.min(Math.max(Number.isFinite(limitParam) ? limitParam : 3, 1), 20)

  const sf = await getStorefrontByUser(userId)
  if (!sf?.id) {
    return NextResponse.json({ reviews: [] })
  }

  const rows = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      body: reviews.body,
      createdAt: reviews.createdAt,
      productTitle: products.title,
      authorName: users.name,
    })
    .from(reviews)
    .innerJoin(products, eq(reviews.productId, products.id))
    .innerJoin(users, eq(reviews.buyerId, users.id))
    .where(and(eq(products.storefrontId, sf.id)))
    .orderBy(desc(reviews.createdAt))
    .limit(limit)

  return NextResponse.json({
    reviews: rows.map((r) => ({
      id: r.id,
      authorName: r.authorName,
      rating: r.rating,
      comment: r.body ?? "",
      productTitle: r.productTitle,
      createdAt: r.createdAt,
    })),
  })
}
