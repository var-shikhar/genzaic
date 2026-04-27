import { NextRequest, NextResponse } from "next/server"
import { db, products, storefronts, orders, orderItems } from "@/lib/db"
import { eq, and } from "drizzle-orm"
import { checkoutSchema } from "@/lib/validations/checkout"
import { auth } from "@/lib/auth"
import { enforceRateLimit } from "@/lib/rate-limit"
import { cache, cacheKeys } from "@/lib/cache"

const PLATFORM_FEE_PERCENT = 0.05 // 5%
const GST_RATE = 0.18 // 18% GST on product price

// POST /api/checkout/create-order
export async function POST(req: NextRequest) {
  // 10 orders per IP per minute — legitimate buyers won't hit this; bots will.
  const limited = enforceRateLimit(req, "checkout", { max: 10, windowSec: 60 })
  if (limited) return limited

  try {
    const body = await req.json()
    const parsed = checkoutSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { productId, buyerName, buyerEmail, buyerPhone, buyerGstin } = parsed.data

    // Get product
    const [product] = await db
      .select()
      .from(products)
      .where(and(eq(products.id, productId), eq(products.isActive, true)))
      .limit(1)

    if (!product) {
      return NextResponse.json({ error: "Product not found or unavailable" }, { status: 404 })
    }

    // Check stock
    if (product.stock !== null && product.stock <= 0) {
      return NextResponse.json({ error: "Product is out of stock" }, { status: 400 })
    }

    // Get storefront for fee mode
    const [storefront] = await db
      .select({ userId: storefronts.userId, platformFeeMode: storefronts.platformFeeMode })
      .from(storefronts)
      .where(eq(storefronts.id, product.storefrontId))
      .limit(1)

    if (!storefront) {
      return NextResponse.json({ error: "Seller storefront not found" }, { status: 404 })
    }

    const baseAmount = parseFloat(product.price)
    const platformFee = parseFloat((baseAmount * PLATFORM_FEE_PERCENT).toFixed(2))
    // GST is always 18% on the product price (digital goods/services)
    const gstAmount = parseFloat((baseAmount * GST_RATE).toFixed(2))

    let subtotal: number
    let totalAmount: number

    if (storefront.platformFeeMode === "buyer") {
      // Buyer pays the fee on top: price + platform fee + GST
      subtotal = baseAmount
      totalAmount = parseFloat((baseAmount + platformFee + gstAmount).toFixed(2))
    } else {
      // Seller absorbs the fee -- buyer pays price + GST only
      subtotal = baseAmount
      totalAmount = parseFloat((baseAmount + gstAmount).toFixed(2))
    }

    // Check if buyer is a logged-in user
    const session = await auth()
    const buyerId = session?.user?.id ?? null

    // Use the actual product file URL as the download link
    const downloadLink = product.deliveryType === "download" ? product.fileUrl : null

    // Generate a unique order number
    const orderNumber = `GZ-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

    // Create order
    const [order] = await db
      .insert(orders)
      .values({
        orderNumber,
        sellerId: storefront.userId,
        buyerId: buyerId,
        buyerEmail,
        buyerName,
        buyerPhone: buyerPhone ?? null,
        buyerGstin: buyerGstin ?? null,
        subtotal: String(subtotal),
        gstAmount: String(gstAmount),
        platformFee: String(platformFee),
        discountAmount: "0",
        totalAmount: String(totalAmount),
        status: "pending",
      })
      .returning()

    // Create order item
    const [item] = await db
      .insert(orderItems)
      .values({
        orderId: order.id,
        productId,
        productTitle: product.title,
        productThumbnail: product.coverImageUrl,
        productDescription: product.description,
        price: String(baseAmount),
        quantity: 1,
        deliveryType: product.deliveryType,
        deliveryStatus: "pending",
        externalUrl: product.externalUrl,
        downloadLink,
        maxDownloads: 5,
        downloadCount: 0,
      })
      .returning()

    // Decrement stock if applicable
    if (product.stock !== null) {
      await db
        .update(products)
        .set({ stock: product.stock - 1 })
        .where(eq(products.id, productId))
    }

    // Bust cached aggregations so the seller's dashboard reflects the new
    // order within 1 dashboard refresh instead of waiting for the 30s TTL.
    cache.delete(cacheKeys.salesStats(storefront.userId))
    cache.delete(cacheKeys.recentOrders(storefront.userId))

    // Return a response shape that matches the frontend expectations
    return NextResponse.json(
      {
        id: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        status: order.status,
        deliveryType: item.deliveryType,
        items: [item],
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("POST /api/checkout/create-order error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
