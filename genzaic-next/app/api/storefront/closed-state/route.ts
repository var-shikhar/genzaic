import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { db, storefronts } from "@/lib/db"
import { closedStateSchema } from "@/lib/validations/storefront"
import { getStorefrontByUser } from "@/lib/db/storefront-helpers"
import { invalidatePublicStorefrontBySlug } from "@/lib/data/public-storefront"

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id as string

  const existing = await getStorefrontByUser(userId)
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 })

  const parsed = closedStateSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    )
  }

  const [updated] = await db
    .update(storefronts)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(storefronts.userId, userId))
    .returning()

  // If currently unpublished, the closed-state page is the visible surface —
  // bust the cache so it picks up the new copy immediately.
  if (existing.publishState === "unpublished" && existing.storeUrl) {
    invalidatePublicStorefrontBySlug(existing.storeUrl)
  }
  return NextResponse.json({ storefront: updated })
}
