import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db, storefronts } from "@/lib/db"
import { eq } from "drizzle-orm"
import { invalidatePublicStorefrontBySlug } from "@/lib/data/public-storefront"
import { getStorefrontByUser } from "@/lib/db/storefront-helpers"

// PATCH /api/storefront/toggle-publish
export async function PATCH(_req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = session.user.id as string

    const existing = await getStorefrontByUser(userId)
    if (!existing) {
      return NextResponse.json({ error: "Storefront not found" }, { status: 404 })
    }

    if (existing.publishState === "never_published") {
      return NextResponse.json(
        {
          error:
            "Use POST /api/storefront/drafts/:id/publish to first-publish.",
        },
        { status: 409 },
      )
    }

    const nextState =
      existing.publishState === "published" ? "unpublished" : "published"

    const [updated] = await db
      .update(storefronts)
      .set({
        publishState: nextState,
        isPublished: nextState === "published",
        lastPublishedAt:
          nextState === "published" ? new Date() : existing.lastPublishedAt,
        updatedAt: new Date(),
      })
      .where(eq(storefronts.userId, userId))
      .returning({
        publishState: storefronts.publishState,
        isPublished: storefronts.isPublished,
      })

    // Critical: publishing/unpublishing changes whether the storefront
    // returns 200 or 404, so the cache MUST be busted immediately.
    if (existing.storeUrl) invalidatePublicStorefrontBySlug(existing.storeUrl)

    return NextResponse.json({
      publishState: updated.publishState,
      isPublished: updated.isPublished,
    })
  } catch (error) {
    console.error("PATCH /api/storefront/toggle-publish error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
