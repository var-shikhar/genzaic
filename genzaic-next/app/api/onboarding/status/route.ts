import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db, users, storefronts, products } from "@/lib/db"
import { eq, count } from "drizzle-orm"

// GET /api/onboarding/status - current onboarding state for the user
export async function GET(_req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = session.user.id as string

    const [user] = await db
      .select({
        onboardingComplete: users.onboardingComplete,
        isSeller: users.isSeller,
        planType: users.planType,
        storeUrl: users.storeUrl,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    if (user.onboardingComplete) {
      return NextResponse.json({ complete: true, step: 4 })
    }

    // Determine how far through onboarding they are
    let step = 1

    // Step 1: account type / seller setup — if isSeller, advance
    if (user.isSeller || user.planType !== "creator") step = Math.max(step, 2)

    // Step 2: storefront setup
    const [storefront] = await db
      .select({ id: storefronts.id, storeName: storefronts.storeName, storeUrl: storefronts.storeUrl })
      .from(storefronts)
      .where(eq(storefronts.userId, userId))
      .limit(1)

    if (storefront?.storeName || storefront?.storeUrl) step = Math.max(step, 3)

    // Step 3: first product
    if (storefront) {
      const [productCount] = await db
        .select({ count: count() })
        .from(products)
        .where(eq(products.storefrontId, storefront.id))
      if (Number(productCount?.count ?? 0) > 0) step = Math.max(step, 4)
    }

    return NextResponse.json({ complete: false, step })
  } catch (error) {
    console.error("GET /api/onboarding/status error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
