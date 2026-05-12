import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db, storefronts } from "@/lib/db"
import { eq, or } from "drizzle-orm"
import { checkSlugSchema } from "@/lib/validations/storefront"

type RouteContext = { params: Promise<{ slug: string }> }

// GET /api/storefront/check-slug/[slug] - check if a storefront slug is available.
// Tests both the legacy `storeUrl` column and the modern `imprintSlug` column
// (each has its own unique index), so the editor surfaces a clash before the
// seller hits the server-side rejection at submit time.
export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = session.user.id as string

    const { slug } = await params

    const parsed = checkSlugSchema.safeParse({ slug })
    if (!parsed.success) {
      return NextResponse.json({ available: false, error: parsed.error.flatten().fieldErrors.slug?.[0] }, { status: 400 })
    }

    const [existing] = await db
      .select({ id: storefronts.id, userId: storefronts.userId })
      .from(storefronts)
      .where(
        or(
          eq(storefronts.storeUrl, slug),
          eq(storefronts.imprintSlug, slug),
        ),
      )
      .limit(1)

    // Available if not taken, or if taken by the current user themselves.
    const available = !existing || existing.userId === userId

    return NextResponse.json({ available })
  } catch (error) {
    console.error("GET /api/storefront/check-slug/[slug] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
