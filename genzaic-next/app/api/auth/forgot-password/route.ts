import { NextRequest, NextResponse, after } from "next/server"
import { db, users } from "@/lib/db"
import { eq } from "drizzle-orm"
import { randomBytes } from "crypto"
import { sendPasswordResetEmail } from "@/lib/email"
import { sendEmailWithRetry } from "@/lib/email/send-with-retry"
import { forgotPasswordSchema } from "@/lib/validations/auth"
import { enforceRateLimit } from "@/lib/rate-limit"
import { env } from "@/lib/env"

export async function POST(req: NextRequest) {
  // 3 reset attempts per IP per 10 minutes — prevents email enumeration spam.
  const limited = await enforceRateLimit(req, "forgot-password", {
    max: 3,
    windowSec: 600,
  })
  if (limited) return limited

  try {
    const body = await req.json()
    const parsed = forgotPasswordSchema.safeParse(body)
    if (!parsed.success)
      return NextResponse.json({ error: "Invalid email" }, { status: 400 })

    const { email } = parsed.data
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    // Always return success to prevent email enumeration
    if (!user)
      return NextResponse.json({
        message: "If that email exists, a reset link was sent.",
      })

    const token = randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    await db
      .update(users)
      .set({
        passwordResetToken: token,
        passwordResetExpiresAt: expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))

    const resetUrl = `${env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`
    after(() =>
      sendEmailWithRetry(
        () => sendPasswordResetEmail(email, user.name, resetUrl),
        {
          label: "password-reset",
          to: email,
        },
      ).catch(() => {}),
    )

    return NextResponse.json({
      message: "If that email exists, a reset link was sent.",
    })
  } catch (error) {
    console.error("error: ", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
