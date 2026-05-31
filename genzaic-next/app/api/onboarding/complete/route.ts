import { NextRequest, NextResponse, after } from "next/server"
import { and, eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { db, users } from "@/lib/db"
import { sendWelcomeEmail } from "@/lib/email"
import { sendEmailWithRetry } from "@/lib/email/send-with-retry"

// POST /api/onboarding/complete - mark onboarding as fully complete
export async function POST(_req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = session.user.id as string

    // Flip onboardingComplete only if it was still false. The returning() rows
    // double as our idempotency check — a non-empty result means *this* call
    // is the one that completed onboarding, so it's the one that should send
    // the welcome email. Re-clicks (or retries) get an empty result and skip.
    const justCompleted = await db
      .update(users)
      .set({ onboardingComplete: true, updatedAt: new Date() })
      .where(and(eq(users.id, userId), eq(users.onboardingComplete, false)))
      .returning({ email: users.email, name: users.name })

    const transitioned = justCompleted[0]
    if (transitioned?.email) {
      // Fire-and-forget. Welcome email is a nice-to-have, never block the
      // response or fail completion if Resend hiccups.
      after(() =>
        sendEmailWithRetry(
          () => sendWelcomeEmail(transitioned.email, transitioned.name ?? "there"),
          { label: "onboarding-welcome", to: transitioned.email },
        ).catch(() => {
          /* terminal failure already logged inside helper */
        }),
      )
    }

    return NextResponse.json({ message: "Onboarding complete", complete: true })
  } catch (error) {
    console.error("POST /api/onboarding/complete error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
