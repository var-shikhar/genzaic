import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db, storefronts, products } from "@/lib/db"
import { eq, and } from "drizzle-orm"

type RouteContext = { params: Promise<{ id: string }> }

// PATCH /api/products/[id]/toggle-status
export async function PATCH(_req: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = session.user.id as string

    const { id } = await params

    const [storefront] = await db
      .select({ id: storefronts.id })
      .from(storefronts)
      .where(eq(storefronts.userId, userId))
      .limit(1)

    if (!storefront) return NextResponse.json({ error: "Product not found" }, { status: 404 })

    const [existing] = await db
      .select({ id: products.id, isActive: products.isActive })
      .from(products)
      .where(and(eq(products.id, id), eq(products.storefrontId, storefront.id)))
      .limit(1)

    if (!existing) return NextResponse.json({ error: "Product not found" }, { status: 404 })

    const [updated] = await db
      .update(products)
      .set({ isActive: !existing.isActive, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning()

    return NextResponse.json(updated)
  } catch (error) {
    console.error("PATCH /api/products/[id]/toggle-status error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
