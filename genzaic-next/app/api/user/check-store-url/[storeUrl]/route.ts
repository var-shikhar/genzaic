import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db, storefronts } from "@/lib/db"
import { eq } from "drizzle-orm"
import { z } from "zod"

const storeUrlSchema = z
  .string()
  .min(3, "Must be at least 3 characters")
  .max(50, "Must be less than 50 characters")
  .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers and hyphens allowed")

type RouteContext = { params: Promise<{ storeUrl: string }> }

// GET /api/user/check-store-url/[storeUrl] - check if a store URL is available
export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = session.user.id as string

    const { storeUrl } = await params

    const parsed = storeUrlSchema.safeParse(storeUrl)
    if (!parsed.success) {
      return NextResponse.json(
        { available: false, error: parsed.error.issues[0]?.message },
        { status: 400 }
      )
    }

    const [existingStorefront] = await db
      .select({ id: storefronts.id, userId: storefronts.userId })
      .from(storefronts)
      .where(eq(storefronts.storeUrl, storeUrl))
      .limit(1)

    const takenByStorefront = existingStorefront && existingStorefront.userId !== userId

    return NextResponse.json({ available: !takenByStorefront })
  } catch (error) {
    console.error("GET /api/user/check-store-url/[storeUrl] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
