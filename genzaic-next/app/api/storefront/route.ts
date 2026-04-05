import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db, storefronts } from "@/lib/db"
import { eq } from "drizzle-orm"
import { storefrontSchema } from "@/lib/validations/storefront"
import { uploadToImageKit, deleteFromImageKit, IMAGEKIT_FOLDERS } from "@/lib/imagekit"

// GET /api/storefront - get the authenticated user's own storefront
export async function GET(_req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = session.user.id as string

    const [storefront] = await db
      .select()
      .from(storefronts)
      .where(eq(storefronts.userId, userId))
      .limit(1)

    if (!storefront) {
      return NextResponse.json({ storefront: null })
    }

    return NextResponse.json(storefront)
  } catch (error) {
    console.error("GET /api/storefront error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/storefront - create or update storefront (with ImageKit for cover/profile images)
export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = session.user.id as string

    const formData = await req.formData()

    const raw: Record<string, unknown> = {}
    formData.forEach((value, key) => {
      if (!["profileImage", "coverImage"].includes(key)) {
        if (value === "true") raw[key] = true
        else if (value === "false") raw[key] = false
        else if (value === "null" || value === "") raw[key] = null
        else raw[key] = value
      }
    })

    const parsed = storefrontSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    // Get existing storefront
    const [existing] = await db
      .select()
      .from(storefronts)
      .where(eq(storefronts.userId, userId))
      .limit(1)

    // Handle profile image
    let profileImageUrl = existing?.profileImageUrl ?? null
    let profileImageFileId = existing?.profileImageFileId ?? null
    const profileImage = formData.get("profileImage") as File | null
    if (profileImage && profileImage.size > 0) {
      if (existing?.profileImageFileId) {
        await deleteFromImageKit(existing.profileImageFileId).catch(() => {})
      }
      const buffer = Buffer.from(await profileImage.arrayBuffer())
      const result = await uploadToImageKit(buffer, profileImage.name, IMAGEKIT_FOLDERS.STOREFRONT)
      profileImageUrl = result.url
      profileImageFileId = result.fileId
    }

    // Handle cover image
    let coverImageUrl = existing?.coverImageUrl ?? null
    let coverImageFileId = existing?.coverImageFileId ?? null
    const coverImage = formData.get("coverImage") as File | null
    if (coverImage && coverImage.size > 0) {
      if (existing?.coverImageFileId) {
        await deleteFromImageKit(existing.coverImageFileId).catch(() => {})
      }
      const buffer = Buffer.from(await coverImage.arrayBuffer())
      const result = await uploadToImageKit(buffer, coverImage.name, IMAGEKIT_FOLDERS.STOREFRONT)
      coverImageUrl = result.url
      coverImageFileId = result.fileId
    }

    const dataToWrite = {
      ...parsed.data,
      profileImageUrl,
      profileImageFileId,
      coverImageUrl,
      coverImageFileId,
      updatedAt: new Date(),
    }

    let upserted

    if (existing) {
      ;[upserted] = await db
        .update(storefronts)
        .set(dataToWrite)
        .where(eq(storefronts.userId, userId))
        .returning()
    } else {
      ;[upserted] = await db
        .insert(storefronts)
        .values({
          userId,
          ...dataToWrite,
        })
        .returning()
    }

    return NextResponse.json(upserted)
  } catch (error) {
    console.error("PUT /api/storefront error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
