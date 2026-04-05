import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db, users } from "@/lib/db"
import { eq } from "drizzle-orm"
import { updateProfileSchema } from "@/lib/validations/user"
import { uploadToImageKit, deleteFromImageKit, IMAGEKIT_FOLDERS } from "@/lib/imagekit"

// GET /api/user/profile
export async function GET(_req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = session.user.id as string

    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        avatarUrl: users.avatarUrl,
        role: users.role,
        isSeller: users.isSeller,
        storeUrl: users.storeUrl,
        planType: users.planType,
        kycStatus: users.kycStatus,
        onboardingComplete: users.onboardingComplete,
        followersCount: users.followersCount,
        totalProducts: users.totalProducts,
        totalSales: users.totalSales,
        totalRevenue: users.totalRevenue,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    return NextResponse.json(user)
  } catch (error) {
    console.error("GET /api/user/profile error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/user/profile - update profile including avatar via ImageKit
export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = session.user.id as string

    const formData = await req.formData()

    const raw: Record<string, unknown> = {}
    formData.forEach((value, key) => {
      if (key !== "avatar") {
        raw[key] = value === "" ? undefined : value
      }
    })

    const parsed = updateProfileSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const [existing] = await db
      .select({ avatarUrl: users.avatarUrl, avatarFileId: users.avatarFileId, storeUrl: users.storeUrl })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (!existing) return NextResponse.json({ error: "User not found" }, { status: 404 })

    // Check storeUrl uniqueness if it's being changed
    if (parsed.data.storeUrl && parsed.data.storeUrl !== existing.storeUrl) {
      const [taken] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.storeUrl, parsed.data.storeUrl))
        .limit(1)
      if (taken && taken.id !== userId) {
        return NextResponse.json({ error: "Store URL is already taken" }, { status: 409 })
      }
    }

    // Handle avatar upload
    let avatarUrl = existing.avatarUrl
    let avatarFileId = existing.avatarFileId
    const avatar = formData.get("avatar") as File | null
    if (avatar && avatar.size > 0) {
      if (existing.avatarFileId) {
        await deleteFromImageKit(existing.avatarFileId).catch(() => {})
      }
      const buffer = Buffer.from(await avatar.arrayBuffer())
      const result = await uploadToImageKit(buffer, avatar.name, IMAGEKIT_FOLDERS.AVATARS)
      avatarUrl = result.url
      avatarFileId = result.fileId
    }

    const updateData: Record<string, unknown> = {
      avatarUrl,
      avatarFileId,
      updatedAt: new Date(),
    }
    if (parsed.data.name !== undefined) updateData.name = parsed.data.name
    if (parsed.data.storeUrl !== undefined) updateData.storeUrl = parsed.data.storeUrl

    await db.update(users).set(updateData).where(eq(users.id, userId))

    const [updated] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        avatarUrl: users.avatarUrl,
        role: users.role,
        isSeller: users.isSeller,
        storeUrl: users.storeUrl,
        planType: users.planType,
        kycStatus: users.kycStatus,
        onboardingComplete: users.onboardingComplete,
        followersCount: users.followersCount,
        totalProducts: users.totalProducts,
        totalSales: users.totalSales,
        totalRevenue: users.totalRevenue,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    return NextResponse.json(updated)
  } catch (error) {
    console.error("PUT /api/user/profile error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
