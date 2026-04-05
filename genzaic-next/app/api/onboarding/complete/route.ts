import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db, users } from "@/lib/db"
import { eq } from "drizzle-orm"

// POST /api/onboarding/complete - mark onboarding as fully complete
export async function POST(_req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = session.user.id as string

    await db
      .update(users)
      .set({ onboardingComplete: true, updatedAt: new Date() })
      .where(eq(users.id, userId))

    return NextResponse.json({ message: "Onboarding complete", complete: true })
  } catch (error) {
    console.error("POST /api/onboarding/complete error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
