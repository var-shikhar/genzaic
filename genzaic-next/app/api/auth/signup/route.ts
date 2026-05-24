import { NextRequest, NextResponse, after } from "next/server"
import { db, users } from "@/lib/db"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"
import { signupApiSchema } from "@/lib/validations/auth"
import { generateOTP } from "@/lib/utils"
import { sendVerificationEmail } from "@/lib/email"
import { sendEmailWithRetry } from "@/lib/email/send-with-retry"
import { enforceRateLimit } from "@/lib/rate-limit"
import { notifyEvent } from "@/lib/notifications/notify"

export async function POST(req: NextRequest) {
  // 5 signups per IP per 5 minutes — protects against bcrypt-CPU + email-send abuse.
  const limited = await enforceRateLimit(req, "signup", { max: 5, windowSec: 300 })
  if (limited) return limited

  try {
    const body = await req.json()
    const parsed = signupApiSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { name, email, password } = parsed.data

    const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1)
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    const [newUser] = await db.insert(users).values({
      name,
      email,
      passwordHash,
      role: "seller",
      isSeller: true,
      emailVerified: false,
      emailVerificationToken: otp,
      emailVerificationExpiresAt: expiresAt,
    }).returning({ id: users.id })

    // Fire-and-forget the verification email with retry. Response is returned
    // immediately; Next.js `after()` runs the send once streaming completes,
    // so a slow Resend call never delays signup.
    after(() =>
      sendEmailWithRetry(() => sendVerificationEmail(email, name, otp), {
        label: "verification",
        to: email,
      }).catch(() => {
        /* terminal failure already logged inside helper */
      }),
    )

    // Welcome notification — email suppressed because signup already sends the
    // verification OTP email; we don't want two emails landing back-to-back.
    try {
      await notifyEvent({
        userId: newUser.id,
        type: "welcome",
        title: "Welcome to GenZaic 🎉",
        message:
          "Glad to have you. Browse the marketplace or start your seller setup any time.",
        link: "/",
        suppress: { email: true },
      })
    } catch (err) {
      console.error("[notifications] welcome emit failed:", err)
    }

    return NextResponse.json({ message: "Account created. Check your email for the OTP.", email }, { status: 201 })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
