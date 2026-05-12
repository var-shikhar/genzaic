import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db, users, storefronts, products } from "@/lib/db"
import { eq, and, desc, count, ilike } from "drizzle-orm"
import { productSchema } from "@/lib/validations/product"
import { uploadToImageKit, IMAGEKIT_FOLDERS } from "@/lib/imagekit"
import { cache, cacheKeys } from "@/lib/cache"
import { invalidatePublicStorefrontBySlug } from "@/lib/data/public-storefront"
import { getStorefrontByUser } from "@/lib/db/storefront-helpers"
import { coerceFormData } from "@/lib/api-form-data"
import {
  parseStringArray,
  parseFileArray,
  ensureTagIds,
  setProductTags,
  addGalleryImages,
  slugify,
} from "@/lib/products-write"
import { generateHexCode } from "@/lib/brand/hex-code"

// GET /api/products - list with pagination/search/filter
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = session.user.id as string

    const { searchParams } = new URL(req.url)
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"))
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "10")))
    const offset = (page - 1) * limit
    const search = searchParams.get("search") ?? ""
    const status = searchParams.get("status") // "active" | "inactive" | undefined

    const storefront = await getStorefrontByUser(userId)
    if (!storefront) {
      return NextResponse.json({ products: [], total: 0, page, limit })
    }

    // Build where conditions
    const conditions = [eq(products.storefrontId, storefront.id)]

    if (search) {
      conditions.push(ilike(products.title, `%${search}%`))
    }

    if (status === "active") {
      conditions.push(eq(products.isActive, true))
    } else if (status === "inactive") {
      conditions.push(eq(products.isActive, false))
    }

    const whereClause = and(...conditions)

    const [totalResult, rows] = await Promise.all([
      db.select({ count: count() }).from(products).where(whereClause),
      db
        .select()
        .from(products)
        .where(whereClause)
        .orderBy(desc(products.createdAt))
        .limit(limit)
        .offset(offset),
    ])

    return NextResponse.json({
      products: rows,
      total: Number(totalResult[0]?.count ?? 0),
      page,
      limit,
    })
  } catch (error) {
    console.error("GET /api/products error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/products - create product with optional thumbnail via ImageKit
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = session.user.id as string

    const formData = await req.formData()

    const raw = coerceFormData(formData, {
      fileKeys: ["thumbnail", "productFile"],
      arrayKeys: ["tagIds", "tagNames", "galleryImages", "removedGalleryImageIds"],
    })
    raw.tagIds = parseStringArray(formData, "tagIds")
    raw.tagNames = parseStringArray(formData, "tagNames")

    const parsed = productSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    // Get or create storefront for this user
    let storefront = await getStorefrontByUser(userId)
    if (!storefront) {
      const [user] = await db
        .select({ name: users.name })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1)
      ;[storefront] = await db
        .insert(storefronts)
        .values({
          userId,
          storeName: user?.name ? `${user.name}'s Store` : undefined,
        })
        .returning()
    }

    // Handle thumbnail upload
    let coverImageUrl: string | undefined
    let coverImageFileId: string | undefined
    const thumbnail = formData.get("thumbnail") as File | null
    if (thumbnail && thumbnail.size > 0) {
      const buffer = Buffer.from(await thumbnail.arrayBuffer())
      const result = await uploadToImageKit(buffer, thumbnail.name, IMAGEKIT_FOLDERS.THUMBNAILS)
      coverImageUrl = result.url
      coverImageFileId = result.fileId
    }

    // Handle product file upload (for downloadable products)
    let fileUrl: string | undefined
    let fileId: string | undefined
    const productFile = formData.get("productFile") as File | null
    if (productFile && productFile.size > 0) {
      const buffer = Buffer.from(await productFile.arrayBuffer())
      const result = await uploadToImageKit(buffer, productFile.name, IMAGEKIT_FOLDERS.PRODUCTS)
      fileUrl = result.url
      fileId = result.fileId
    }

    const { title, description, price, originalPrice, categoryId, deliveryType, externalUrl,
      sellerContactEmail, sellerContactPhone, sellerContactWhatsapp,
      subscriptionDuration, stock, isActive, tagIds, tagNames } = parsed.data

    // Pick a unique slug per storefront. If conflict, append a short suffix.
    const baseSlug = slugify(title) || "product"
    let slug = baseSlug
    for (let attempts = 0; attempts < 5; attempts += 1) {
      const [clash] = await db
        .select({ id: products.id })
        .from(products)
        .where(and(eq(products.storefrontId, storefront.id), eq(products.slug, slug)))
        .limit(1)
      if (!clash) break
      slug = `${baseSlug}-${Math.random().toString(36).slice(2, 7)}`
    }

    // Pick a unique 4-char hex code per storefront. Retry on collision.
    let hexCode = generateHexCode()
    for (let attempts = 0; attempts < 32; attempts += 1) {
      const [clash] = await db
        .select({ id: products.id })
        .from(products)
        .where(and(eq(products.storefrontId, storefront.id), eq(products.hexCode, hexCode)))
        .limit(1)
      if (!clash) break
      hexCode = generateHexCode()
    }

    // Atomic: product insert + denormalized counter recount, so a partial
     // failure can't leave users.totalProducts out of sync with the products
     // table.
    const product = await db.transaction(async (tx) => {
      const [inserted] = await tx
        .insert(products)
        .values({
          storefrontId: storefront.id,
          categoryId: categoryId ?? null,
          slug,
          hexCode,
          title,
          description: description ?? null,
          price: String(price),
          originalPrice: originalPrice != null ? String(originalPrice) : null,
          deliveryType,
          externalUrl: externalUrl ?? null,
          sellerContactEmail: sellerContactEmail ?? null,
          sellerContactPhone: sellerContactPhone ?? null,
          sellerContactWhatsapp: sellerContactWhatsapp ?? null,
          subscriptionDuration: subscriptionDuration ?? null,
          stock: stock ?? null,
          isActive: isActive ?? true,
          coverImageUrl: coverImageUrl ?? null,
          coverImageFileId: coverImageFileId ?? null,
          fileUrl: fileUrl ?? null,
          fileId: fileId ?? null,
        })
        .returning()

      const [countResult] = await tx
        .select({ count: count() })
        .from(products)
        .where(eq(products.storefrontId, storefront.id))
      await tx
        .update(users)
        .set({ totalProducts: Number(countResult?.count ?? 0), updatedAt: new Date() })
        .where(eq(users.id, userId))

      return inserted
    })

    // Tags: ensure rows exist, write join table.
    const finalTagIds = await ensureTagIds(tagIds ?? [], tagNames ?? [])
    if (finalTagIds.length > 0) await setProductTags(product.id, finalTagIds)

    // Gallery: upload any provided images.
    const galleryFiles = parseFileArray(formData, "galleryImages")
    if (galleryFiles.length > 0) await addGalleryImages(product.id, galleryFiles)

    // Bust caches that now contain stale data: dashboard stats + the
    // public storefront payload that lists this product.
    cache.delete(cacheKeys.productStats(storefront.id))
    if (storefront.storeUrl) invalidatePublicStorefrontBySlug(storefront.storeUrl)

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("POST /api/products error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
