import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db, storefronts } from "@/lib/db"
import { eq } from "drizzle-orm"

// PATCH /api/storefront/toggle-publish
export async function PATCH(_req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = session.user.id as string

    const [existing] = await db
      .select({ id: storefronts.id, isPublished: storefronts.isPublished })
      .from(storefronts)
      .where(eq(storefronts.userId, userId))
      .limit(1)

    if (!existing) {
      return NextResponse.json({ error: "Storefront not found" }, { status: 404 })
    }

    const [updated] = await db
      .update(storefronts)
      .set({ isPublished: !existing.isPublished, updatedAt: new Date() })
      .where(eq(storefronts.userId, userId))
      .returning({ isPublished: storefronts.isPublished })

    return NextResponse.json({ isPublished: updated.isPublished })
  } catch (error) {
    console.error("PATCH /api/storefront/toggle-publish error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
