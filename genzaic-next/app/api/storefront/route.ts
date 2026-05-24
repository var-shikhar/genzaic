import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db, storefronts } from "@/lib/db"
import { eq } from "drizzle-orm"
import { storefrontSchema } from "@/lib/validations/storefront"
import type { ShowcaseInput } from "@/lib/validations/storefront"
import { parseShowcaseUrl } from "@/lib/showcase/parse-url"
import { uploadToImageKit, deleteFromImageKit, IMAGEKIT_FOLDERS } from "@/lib/imagekit"
import { invalidatePublicStorefrontBySlug } from "@/lib/data/public-storefront"
import { getStorefrontByUser } from "@/lib/db/storefront-helpers"
import { coerceFormData } from "@/lib/api-form-data"

// GET /api/storefront - get the authenticated user's own storefront
export async function GET(_req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = session.user.id as string

    const storefront = await getStorefrontByUser(userId)
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

    const raw = coerceFormData(formData, {
      fileKeys: ["profileImage", "coverImage"],
      arrayKeys: ["showcase"], // skip — we parse this manually as JSON below
      emptyAs: "null",
      treatStringNullAsNull: true,
    })

    // Showcase is sent as a JSON-stringified payload (or omitted/null to clear).
    const showcaseField = formData.get("showcase")
    if (typeof showcaseField === "string") {
      if (showcaseField === "" || showcaseField === "null") {
        raw.showcase = null
      } else {
        try {
          raw.showcase = JSON.parse(showcaseField)
        } catch {
          return NextResponse.json(
            { error: "Invalid showcase JSON" },
            { status: 400 },
          )
        }
      }
    }

    const parsed = storefrontSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    // Defense in depth: re-run the URL parser server-side and reject any
    // payload where the URLs don't match what the parser would canonicalize.
    // The editor uses the same parser client-side, so a well-behaved client
    // never trips this — but a hand-crafted request could.
    if (parsed.data.showcase) {
      const sanitized = sanitizeShowcase(parsed.data.showcase)
      if (sanitized === "featured-invalid") {
        return NextResponse.json(
          { error: "Featured showcase URL could not be parsed" },
          { status: 400 },
        )
      }
      parsed.data.showcase = sanitized
    }

    const existing = await getStorefrontByUser(userId)

    // Out-of-band signals: client sets these when the seller hits the ✕ on a
    // previously-saved image. Upload wins over remove if both are set.
    const removeProfileImage = formData.get("removeProfileImage") === "true"
    const removeCoverImage = formData.get("removeCoverImage") === "true"

    // Both image slots run independently in parallel. Within each slot the
    // delete-old + upload-new also overlap. Cuts the previous 4-call serial
    // chain (~500ms typical) into a single ~150ms wait.
    type ImageResult = { url: string | null; fileId: string | null }

    async function handleImageSlot(
      newFile: File | null,
      removeFlag: boolean,
      existingFileId: string | null | undefined,
      existingUrl: string | null | undefined,
      folder: string,
    ): Promise<ImageResult> {
      if (newFile && newFile.size > 0) {
        const [, uploaded] = await Promise.all([
          existingFileId
            ? deleteFromImageKit(existingFileId).catch(() => {})
            : Promise.resolve(),
          newFile
            .arrayBuffer()
            .then((ab) => uploadToImageKit(Buffer.from(ab), newFile.name, folder)),
        ])
        return { url: uploaded.url, fileId: uploaded.fileId }
      }
      if (removeFlag) {
        if (existingFileId) {
          await deleteFromImageKit(existingFileId).catch(() => {})
        }
        return { url: null, fileId: null }
      }
      return { url: existingUrl ?? null, fileId: existingFileId ?? null }
    }

    const profileImage = formData.get("profileImage") as File | null
    const coverImage = formData.get("coverImage") as File | null

    const [profileResult, coverResult] = await Promise.all([
      handleImageSlot(
        profileImage,
        removeProfileImage,
        existing?.profileImageFileId,
        existing?.profileImageUrl,
        IMAGEKIT_FOLDERS.STOREFRONT,
      ),
      handleImageSlot(
        coverImage,
        removeCoverImage,
        existing?.coverImageFileId,
        existing?.coverImageUrl,
        IMAGEKIT_FOLDERS.STOREFRONT,
      ),
    ])

    const profileImageUrl = profileResult.url
    const profileImageFileId = profileResult.fileId
    const coverImageUrl = coverResult.url
    const coverImageFileId = coverResult.fileId

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

    // Bust the public caches so the next anonymous visitor sees fresh data.
    // Also bust the previous slug if the seller renamed their store URL.
    if (upserted?.storeUrl) invalidatePublicStorefrontBySlug(upserted.storeUrl)
    if (existing?.storeUrl && existing.storeUrl !== upserted?.storeUrl) {
      invalidatePublicStorefrontBySlug(existing.storeUrl)
    }

    return NextResponse.json(upserted)
  } catch (error) {
    console.error("PUT /api/storefront error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function sanitizeShowcase(
  showcase: ShowcaseInput,
): ShowcaseInput | "featured-invalid" {
  // Re-parse featured. If it fails, the whole featured slot was tampered with.
  let featured = showcase.featured
  if (featured) {
    const reparsed = parseShowcaseUrl(featured.url)
    if (!reparsed) return "featured-invalid"
    featured = {
      ...featured,
      normalizedUrl: reparsed.normalizedUrl,
      embedUrl: reparsed.embedUrl,
      platform: reparsed.platform,
      kind: reparsed.kind,
      externalId: reparsed.externalId,
    }
  }

  // Items that don't reparse get silently dropped. We prefer that to a hard
  // failure because a creator with 3 good items and 1 bad one shouldn't lose
  // the whole save.
  const items = showcase.items
    .map((it) => {
      const reparsed = parseShowcaseUrl(it.url)
      if (!reparsed) return null
      return {
        ...it,
        normalizedUrl: reparsed.normalizedUrl,
        embedUrl: reparsed.embedUrl,
        platform: reparsed.platform,
        kind: reparsed.kind,
        externalId: reparsed.externalId,
      }
    })
    .filter((it): it is NonNullable<typeof it> => it !== null)

  return { ...showcase, featured, items }
}
