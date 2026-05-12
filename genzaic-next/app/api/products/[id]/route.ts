import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db, products, productImages, productTags, tags, users } from "@/lib/db"
import { eq, and, asc, count } from "drizzle-orm"
import { getStorefrontByUser } from "@/lib/db/storefront-helpers"
import { coerceFormData } from "@/lib/api-form-data"

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function whereProductKey(storefrontId: string, key: string) {
  if (UUID_RE.test(key)) {
    return and(eq(products.id, key), eq(products.storefrontId, storefrontId))
  }
  return and(eq(products.slug, key), eq(products.storefrontId, storefrontId))
}
import { updateProductSchema } from "@/lib/validations/product"
import { uploadToImageKit, deleteFromImageKit, IMAGEKIT_FOLDERS } from "@/lib/imagekit"
import { cache, cacheKeys } from "@/lib/cache"
import { invalidatePublicStorefrontBySlug } from "@/lib/data/public-storefront"
import {
  parseStringArray,
  parseFileArray,
  ensureTagIds,
  setProductTags,
  addGalleryImages,
  removeGalleryImages,
} from "@/lib/products-write"

type RouteContext = { params: Promise<{ id: string }> }

// GET /api/products/[id]
export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = session.user.id as string

    const { id } = await params

    const storefront = await getStorefrontByUser(userId)
    if (!storefront) return NextResponse.json({ error: "Product not found" }, { status: 404 })

    const [product] = await db
      .select()
      .from(products)
      .where(whereProductKey(storefront.id, id))
      .limit(1)

    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 })

    const [galleryRows, tagRows] = await Promise.all([
      db
        .select({ id: productImages.id, imageUrl: productImages.imageUrl })
        .from(productImages)
        .where(eq(productImages.productId, product.id))
        .orderBy(asc(productImages.sortOrder)),
      db
        .select({ id: tags.id, name: tags.name })
        .from(productTags)
        .innerJoin(tags, eq(tags.id, productTags.tagId))
        .where(eq(productTags.productId, product.id)),
    ])

    return NextResponse.json({ ...product, gallery: galleryRows, tags: tagRows })
  } catch (error) {
    console.error("GET /api/products/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/products/[id]
export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = session.user.id as string

    const { id } = await params

    const storefront = await getStorefrontByUser(userId)
    if (!storefront) return NextResponse.json({ error: "Product not found" }, { status: 404 })

    const [existing] = await db
      .select()
      .from(products)
      .where(whereProductKey(storefront.id, id))
      .limit(1)

    if (!existing) return NextResponse.json({ error: "Product not found" }, { status: 404 })

    const formData = await req.formData()

    const raw = coerceFormData(formData, {
      fileKeys: ["thumbnail", "productFile"],
      arrayKeys: ["tagIds", "tagNames", "galleryImages", "removedGalleryImageIds"],
    })
    const tagIdsArr = parseStringArray(formData, "tagIds")
    const tagNamesArr = parseStringArray(formData, "tagNames")
    if (tagIdsArr.length > 0 || tagNamesArr.length > 0) {
      raw.tagIds = tagIdsArr
      raw.tagNames = tagNamesArr
    }

    const parsed = updateProductSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    // Handle thumbnail upload/replacement
    let coverImageUrl = existing.coverImageUrl
    let coverImageFileId = existing.coverImageFileId
    const thumbnail = formData.get("thumbnail") as File | null
    if (thumbnail && thumbnail.size > 0) {
      if (existing.coverImageFileId) {
        await deleteFromImageKit(existing.coverImageFileId).catch(() => {})
      }
      const buffer = Buffer.from(await thumbnail.arrayBuffer())
      const result = await uploadToImageKit(buffer, thumbnail.name, IMAGEKIT_FOLDERS.THUMBNAILS)
      coverImageUrl = result.url
      coverImageFileId = result.fileId
    }

    // Handle product file upload/replacement
    let fileUrl = existing.fileUrl
    let fileId = existing.fileId
    const productFile = formData.get("productFile") as File | null
    if (productFile && productFile.size > 0) {
      if (existing.fileId) {
        await deleteFromImageKit(existing.fileId).catch(() => {})
      }
      const buffer = Buffer.from(await productFile.arrayBuffer())
      const result = await uploadToImageKit(buffer, productFile.name, IMAGEKIT_FOLDERS.PRODUCTS)
      fileUrl = result.url
      fileId = result.fileId
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
      coverImageUrl,
      coverImageFileId,
      fileUrl,
      fileId,
    }

    const { title, description, price, originalPrice, categoryId, deliveryType, externalUrl,
      sellerContactEmail, sellerContactPhone, sellerContactWhatsapp,
      subscriptionDuration, stock, isActive, tagIds, tagNames } = parsed.data

    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description ?? null
    if (price !== undefined) updateData.price = String(price)
    if (originalPrice !== undefined) updateData.originalPrice = originalPrice != null ? String(originalPrice) : null
    if (categoryId !== undefined) updateData.categoryId = categoryId ?? null
    if (deliveryType !== undefined) updateData.deliveryType = deliveryType
    if (externalUrl !== undefined) updateData.externalUrl = externalUrl ?? null
    if (sellerContactEmail !== undefined) updateData.sellerContactEmail = sellerContactEmail ?? null
    if (sellerContactPhone !== undefined) updateData.sellerContactPhone = sellerContactPhone ?? null
    if (sellerContactWhatsapp !== undefined) updateData.sellerContactWhatsapp = sellerContactWhatsapp ?? null
    if (subscriptionDuration !== undefined) updateData.subscriptionDuration = subscriptionDuration ?? null
    if (stock !== undefined) updateData.stock = stock ?? null
    if (isActive !== undefined) updateData.isActive = isActive

    const [updated] = await db
      .update(products)
      .set(updateData)
      .where(eq(products.id, existing.id))
      .returning()

    // Tag join sync — only when client sent tags arrays at all.
    if (tagIds !== undefined || tagNames !== undefined) {
      const finalTagIds = await ensureTagIds(tagIds ?? [], tagNames ?? [])
      await setProductTags(existing.id, finalTagIds)
    }

    // Gallery: remove first, then add new.
    const removedIds = parseStringArray(formData, "removedGalleryImageIds")
    if (removedIds.length > 0) await removeGalleryImages(existing.id, removedIds)
    const galleryFiles = parseFileArray(formData, "galleryImages")
    if (galleryFiles.length > 0) await addGalleryImages(existing.id, galleryFiles)

    // Bust stale reads: product stats (counts/aggregates) and every public
    // storefront cache entry that exposes this product.
    cache.delete(cacheKeys.productStats(storefront.id))
    if (storefront.storeUrl) invalidatePublicStorefrontBySlug(storefront.storeUrl)

    // Re-load gallery + tags so the response shape matches GET.
    // Otherwise client caches with the bare row and the next render
    // shows empty gallery/tags until a manual refetch.
    const [galleryRowsAfter, tagRowsAfter] = await Promise.all([
      db
        .select({ id: productImages.id, imageUrl: productImages.imageUrl })
        .from(productImages)
        .where(eq(productImages.productId, existing.id))
        .orderBy(asc(productImages.sortOrder)),
      db
        .select({ id: tags.id, name: tags.name })
        .from(productTags)
        .innerJoin(tags, eq(tags.id, productTags.tagId))
        .where(eq(productTags.productId, existing.id)),
    ])

    return NextResponse.json({ ...updated, gallery: galleryRowsAfter, tags: tagRowsAfter })
  } catch (error) {
    console.error("PUT /api/products/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/products/[id]
export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = session.user.id as string

    const { id } = await params

    const storefront = await getStorefrontByUser(userId)
    if (!storefront) return NextResponse.json({ error: "Product not found" }, { status: 404 })

    const [existing] = await db
      .select()
      .from(products)
      .where(whereProductKey(storefront.id, id))
      .limit(1)

    if (!existing) return NextResponse.json({ error: "Product not found" }, { status: 404 })

    // Delete files from ImageKit if present
    if (existing.coverImageFileId) {
      await deleteFromImageKit(existing.coverImageFileId).catch(() => {})
    }
    if (existing.fileId) {
      await deleteFromImageKit(existing.fileId).catch(() => {})
    }

    // Atomic delete + denormalized counter recount so users.totalProducts
    // doesn't drift upward as products are removed.
    await db.transaction(async (tx) => {
      await tx.delete(products).where(eq(products.id, existing.id))
      const [countResult] = await tx
        .select({ count: count() })
        .from(products)
        .where(eq(products.storefrontId, storefront.id))
      await tx
        .update(users)
        .set({ totalProducts: Number(countResult?.count ?? 0), updatedAt: new Date() })
        .where(eq(users.id, userId))
    })

    // Bust stale reads: product stats + public storefront listing.
    cache.delete(cacheKeys.productStats(storefront.id))
    if (storefront.storeUrl) invalidatePublicStorefrontBySlug(storefront.storeUrl)

    return NextResponse.json({ message: "Product deleted" })
  } catch (error) {
    console.error("DELETE /api/products/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
