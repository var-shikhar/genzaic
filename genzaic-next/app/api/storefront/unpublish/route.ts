import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { db, storefronts } from "@/lib/db"
import { getStorefrontByUser } from "@/lib/db/storefront-helpers"
import { invalidatePublicStorefrontBySlug } from "@/lib/data/public-storefront"

export async function POST(_req: NextRequest) {
  const session = await auth()
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id as string

  const existing = await getStorefrontByUser(userId)
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 })

  if (existing.publishState === "never_published") {
    return NextResponse.json(
      { error: "Cannot unpublish a store that was never published" },
      { status: 409 },
    )
  }

  const [updated] = await db
    .update(storefronts)
    .set({
      publishState: "unpublished",
      isPublished: false,
      updatedAt: new Date(),
    })
    .where(eq(storefronts.userId, userId))
    .returning()

  if (existing.storeUrl) invalidatePublicStorefrontBySlug(existing.storeUrl)
  return NextResponse.json({ storefront: updated })
}
