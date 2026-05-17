import { NextRequest, NextResponse } from "next/server"
import { db, users, storefronts } from "@/lib/db"
import { eq, and, gt } from "drizzle-orm"
import { verifyOTPSchema } from "@/lib/validations/auth"
import { enforceRateLimit } from "@/lib/rate-limit"

export async function POST(req: NextRequest) {
  // 10 OTP attempts per IP per minute. OTPs are 6 digits (10^6 space) and
  // expire in 10 minutes, so a single inbox gets at most ~100 guesses per
  // OTP — guess probability ~0.01%. Without this an attacker could try
  // thousands per second.
  const limited = await enforceRateLimit(req, "verify-email", { max: 10, windowSec: 60 })
  if (limited) return limited

  try {
    const body = await req.json()
    const parsed = verifyOTPSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    const { email, otp } = parsed.data

    const [user] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.email, email),
          eq(users.emailVerificationToken, otp),
          gt(users.emailVerificationExpiresAt, new Date())
        )
      )
      .limit(1)

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 })
    }

    await db
      .update(users)
      .set({
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiresAt: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))

    // Create storefront for sellers with a friendly default name.
    if (user.role === "seller" || user.isSeller) {
      await db
        .insert(storefronts)
        .values({
          userId: user.id,
          storeName: user.name ? `${user.name}'s Store` : undefined,
        })
        .onConflictDoNothing()
    }

    return NextResponse.json({ success: true, message: "Email verified successfully" })
  } catch (error) {
    console.error("Verify email error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
