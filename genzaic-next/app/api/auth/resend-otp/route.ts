import { NextRequest, NextResponse, after } from "next/server"
import { db, users } from "@/lib/db"
import { eq } from "drizzle-orm"
import { generateOTP } from "@/lib/utils"
import { sendVerificationEmail } from "@/lib/email"
import { sendEmailWithRetry } from "@/lib/email/send-with-retry"
import { enforceRateLimit } from "@/lib/rate-limit"

export async function POST(req: NextRequest) {
  // 3 resends per IP per 10 minutes — prevents using this as an email-spam
  // vector while still letting a stuck user genuinely re-request.
  const limited = await enforceRateLimit(req, "resend-otp", {
    max: 3,
    windowSec: 600,
  })
  if (limited) return limited

  try {
    const { email } = await req.json()
    if (!email)
      return NextResponse.json({ error: "Email is required" }, { status: 400 })

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    if (user.emailVerified)
      return NextResponse.json(
        { error: "Email already verified" },
        { status: 400 },
      )

    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    await db
      .update(users)
      .set({
        emailVerificationToken: otp,
        emailVerificationExpiresAt: expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))

    after(() =>
      sendEmailWithRetry(() => sendVerificationEmail(email, user.name, otp), {
        label: "verification-resend",
        to: email,
      }).catch(() => {}),
    )

    return NextResponse.json({ message: "OTP sent successfully" })
  } catch (error) {
    console.error("error: ", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
