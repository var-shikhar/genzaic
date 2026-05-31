import { NextRequest, NextResponse } from "next/server"
import { db, users } from "@/lib/db"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"
import { resetPasswordApiSchema } from "@/lib/validations/auth"
import { enforceRateLimit } from "@/lib/rate-limit"

export async function POST(req: NextRequest) {
  // 5 attempts per IP per 10 minutes. The reset token is 256-bit so brute
  // force is infeasible; this guards against an attacker burning a known
  // valid token via many concurrent attempts before the user can use it.
  const limited = await enforceRateLimit(req, "reset-password", { max: 5, windowSec: 600 })
  if (limited) return limited

  try {
    const body = await req.json()
    const parsed = resetPasswordApiSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { token, password } = parsed.data

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.passwordResetToken, token))
      .limit(1)

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 })
    }

    if (!user.passwordResetExpiresAt || user.passwordResetExpiresAt < new Date()) {
      return NextResponse.json({ error: "Reset link has expired. Please request a new one." }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    // Consuming a valid reset token proves the user controls the inbox the
    // token was delivered to — same equivalence every magic-link flow uses.
    // Mark them as email-verified here so guest checkouts (which auto-create
    // a buyer with emailVerified=false + this same token) can actually log
    // in afterward; without this, the credentials provider throws
    // EMAIL_NOT_VERIFIED even though the buyer just set a password.
    await db
      .update(users)
      .set({
        passwordHash,
        emailVerified: true,
        passwordResetToken: null,
        passwordResetExpiresAt: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))

    return NextResponse.json({ message: "Password reset successfully. You can now log in." })
  } catch (error) {
    console.error("POST /api/auth/reset-password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
