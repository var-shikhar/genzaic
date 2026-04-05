import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db, users } from "@/lib/db"
import { eq } from "drizzle-orm"
import { changePasswordSchema } from "@/lib/validations/auth"
import bcrypt from "bcryptjs"

// PUT /api/user/password - change password
export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = session.user.id as string

    const body = await req.json()
    const parsed = changePasswordSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { currentPassword, newPassword } = parsed.data

    const [user] = await db
      .select({ passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })
    if (!user.passwordHash) {
      return NextResponse.json(
        { error: "Password change is not available for OAuth accounts" },
        { status: 400 }
      )
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!isValid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
    }

    const newHash = await bcrypt.hash(newPassword, 12)
    await db
      .update(users)
      .set({ passwordHash: newHash, updatedAt: new Date() })
      .where(eq(users.id, userId))

    return NextResponse.json({ message: "Password updated successfully" })
  } catch (error) {
    console.error("PUT /api/user/password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
