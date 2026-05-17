import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db, users } from "@/lib/db"
import { eq } from "drizzle-orm"
import { z } from "zod"
import { enforceRateLimit } from "@/lib/rate-limit"

const planSchema = z.object({
  plan: z.enum(["creator", "startup", "enterprise"]),
})

// POST /api/onboarding/plan - select a pricing plan during onboarding
export async function POST(req: NextRequest) {
  // 5 plan changes per IP per hour. This endpoint flips role → seller and
  // upgrades isSeller; should be hit at most a few times per onboarding.
  const limited = await enforceRateLimit(req, "onboarding-plan", { max: 5, windowSec: 3600 })
  if (limited) return limited

  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = session.user.id as string

    const body = await req.json()
    const parsed = planSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const [updated] = await db
      .update(users)
      .set({
        planType: parsed.data.plan,
        isSeller: true,
        role: "seller",
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        planType: users.planType,
        isSeller: users.isSeller,
        role: users.role,
      })

    return NextResponse.json({ message: "Plan selected", ...updated })
  } catch (error) {
    console.error("POST /api/onboarding/plan error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
