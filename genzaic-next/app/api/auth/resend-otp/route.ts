import { NextRequest, NextResponse } from "next/server"
import { db, users } from "@/lib/db"
import { eq } from "drizzle-orm"
import { generateOTP } from "@/lib/utils"
import { sendVerificationEmail } from "@/lib/email"

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 })

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })
    if (user.emailVerified) return NextResponse.json({ error: "Email already verified" }, { status: 400 })

    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    await db.update(users).set({
      emailVerificationToken: otp,
      emailVerificationExpiresAt: expiresAt,
      updatedAt: new Date(),
    }).where(eq(users.id, user.id))

    await sendVerificationEmail(email, user.name, otp)

    return NextResponse.json({ message: "OTP sent successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
