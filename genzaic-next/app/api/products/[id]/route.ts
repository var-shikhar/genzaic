import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db, storefronts, products } from "@/lib/db"
import { eq, and } from "drizzle-orm"
import { updateProductSchema } from "@/lib/validations/product"
import { uploadToImageKit, deleteFromImageKit, IMAGEKIT_FOLDERS } from "@/lib/imagekit"

type RouteContext = { params: Promise<{ id: string }> }

// GET /api/products/[id]
export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = session.user.id as string

    const { id } = await params

    const [storefront] = await db
      .select({ id: storefronts.id })
      .from(storefronts)
      .where(eq(storefronts.userId, userId))
      .limit(1)

    if (!storefront) return NextResponse.json({ error: "Product not found" }, { status: 404 })

    const [product] = await db
      .select()
      .from(products)
      .where(and(eq(products.id, id), eq(products.storefrontId, storefront.id)))
      .limit(1)

    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 })

    return NextResponse.json(product)
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

    const [storefront] = await db
      .select({ id: storefronts.id })
      .from(storefronts)
      .where(eq(storefronts.userId, userId))
      .limit(1)

    if (!storefront) return NextResponse.json({ error: "Product not found" }, { status: 404 })

    const [existing] = await db
      .select()
      .from(products)
      .where(and(eq(products.id, id), eq(products.storefrontId, storefront.id)))
      .limit(1)

    if (!existing) return NextResponse.json({ error: "Product not found" }, { status: 404 })

    const formData = await req.formData()

    const raw: Record<string, unknown> = {}
    formData.forEach((value, key) => {
      if (key !== "thumbnail" && key !== "productFile") {
        if (value === "true") raw[key] = true
        else if (value === "false") raw[key] = false
        else if (value === "") raw[key] = undefined
        else raw[key] = value
      }
    })

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

    const { title, description, price, originalPrice, deliveryType, externalUrl,
      sellerContactEmail, sellerContactPhone, sellerContactWhatsapp,
      subscriptionDuration, seoTitle, seoKeywords, stock, isActive } = parsed.data

    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description ?? null
    if (price !== undefined) updateData.price = String(price)
    if (originalPrice !== undefined) updateData.originalPrice = originalPrice != null ? String(originalPrice) : null
    if (deliveryType !== undefined) updateData.deliveryType = deliveryType
    if (externalUrl !== undefined) updateData.externalUrl = externalUrl ?? null
    if (sellerContactEmail !== undefined) updateData.sellerContactEmail = sellerContactEmail ?? null
    if (sellerContactPhone !== undefined) updateData.sellerContactPhone = sellerContactPhone ?? null
    if (sellerContactWhatsapp !== undefined) updateData.sellerContactWhatsapp = sellerContactWhatsapp ?? null
    if (subscriptionDuration !== undefined) updateData.subscriptionDuration = subscriptionDuration ?? null
    if (seoTitle !== undefined) updateData.seoTitle = seoTitle ?? null
    if (seoKeywords !== undefined) updateData.seoKeywords = seoKeywords ?? null
    if (stock !== undefined) updateData.stock = stock ?? null
    if (isActive !== undefined) updateData.isActive = isActive

    const [updated] = await db
      .update(products)
      .set(updateData)
      .where(eq(products.id, id))
      .returning()

    return NextResponse.json(updated)
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

    const [storefront] = await db
      .select({ id: storefronts.id })
      .from(storefronts)
      .where(eq(storefronts.userId, userId))
      .limit(1)

    if (!storefront) return NextResponse.json({ error: "Product not found" }, { status: 404 })

    const [existing] = await db
      .select()
      .from(products)
      .where(and(eq(products.id, id), eq(products.storefrontId, storefront.id)))
      .limit(1)

    if (!existing) return NextResponse.json({ error: "Product not found" }, { status: 404 })

    // Delete files from ImageKit if present
    if (existing.coverImageFileId) {
      await deleteFromImageKit(existing.coverImageFileId).catch(() => {})
    }
    if (existing.fileId) {
      await deleteFromImageKit(existing.fileId).catch(() => {})
    }

    await db.delete(products).where(eq(products.id, id))

    return NextResponse.json({ message: "Product deleted" })
  } catch (error) {
    console.error("DELETE /api/products/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
