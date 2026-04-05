import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db, users, storefronts, products } from "@/lib/db"
import { eq, and, desc, count, ilike } from "drizzle-orm"
import { productSchema } from "@/lib/validations/product"
import { uploadToImageKit, IMAGEKIT_FOLDERS } from "@/lib/imagekit"

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

    // Get the user's storefront
    const [storefront] = await db
      .select({ id: storefronts.id })
      .from(storefronts)
      .where(eq(storefronts.userId, userId))
      .limit(1)

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

    // Extract and coerce fields from FormData
    const raw: Record<string, unknown> = {}
    formData.forEach((value, key) => {
      if (key !== "thumbnail" && key !== "productFile") {
        if (value === "true") raw[key] = true
        else if (value === "false") raw[key] = false
        else raw[key] = value === "" ? undefined : value
      }
    })

    const parsed = productSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    // Get or create storefront for this user
    let [storefront] = await db
      .select({ id: storefronts.id })
      .from(storefronts)
      .where(eq(storefronts.userId, userId))
      .limit(1)

    if (!storefront) {
      const [user] = await db
        .select({ name: users.name })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1)

      const [newStorefront] = await db
        .insert(storefronts)
        .values({
          userId,
          storeName: user?.name ?? undefined,
        })
        .returning({ id: storefronts.id })

      storefront = newStorefront
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

    const { title, description, price, originalPrice, deliveryType, externalUrl,
      sellerContactEmail, sellerContactPhone, sellerContactWhatsapp,
      subscriptionDuration, seoTitle, seoKeywords, stock, isActive } = parsed.data

    const [product] = await db
      .insert(products)
      .values({
        storefrontId: storefront.id,
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
        seoTitle: seoTitle ?? null,
        seoKeywords: seoKeywords ?? null,
        stock: stock ?? null,
        isActive: isActive ?? true,
        coverImageUrl: coverImageUrl ?? null,
        coverImageFileId: coverImageFileId ?? null,
        fileUrl: fileUrl ?? null,
        fileId: fileId ?? null,
      })
      .returning()

    // Update totalProducts counter on user
    const [countResult] = await db
      .select({ count: count() })
      .from(products)
      .where(eq(products.storefrontId, storefront.id))
    await db
      .update(users)
      .set({ totalProducts: Number(countResult?.count ?? 0), updatedAt: new Date() })
      .where(eq(users.id, userId))

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("POST /api/products error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
