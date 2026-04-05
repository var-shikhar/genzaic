import { NextRequest, NextResponse } from "next/server"
import { db, users } from "@/lib/db"
import { eq } from "drizzle-orm"
import { randomBytes } from "crypto"
import { sendPasswordResetEmail } from "@/lib/email"
import { forgotPasswordSchema } from "@/lib/validations/auth"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = forgotPasswordSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: "Invalid email" }, { status: 400 })

    const { email } = parsed.data
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)

    // Always return success to prevent email enumeration
    if (!user) return NextResponse.json({ message: "If that email exists, a reset link was sent." })

    const token = randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    await db.update(users).set({
      passwordResetToken: token,
      passwordResetExpiresAt: expiresAt,
      updatedAt: new Date(),
    }).where(eq(users.id, user.id))

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`
    await sendPasswordResetEmail(email, user.name, resetUrl)

    return NextResponse.json({ message: "If that email exists, a reset link was sent." })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
