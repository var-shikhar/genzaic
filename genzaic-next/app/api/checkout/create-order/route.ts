import { NextRequest, NextResponse } from "next/server"
import { randomBytes } from "crypto"
import { db, products, storefronts, orders, orderItems, users, payments } from "@/lib/db"
import { eq, and } from "drizzle-orm"
import { checkoutSchema } from "@/lib/validations/checkout"
import { auth } from "@/lib/auth"
import { enforceRateLimit } from "@/lib/rate-limit"
import { PLATFORM_FEE_PERCENT, GST_RATE } from "@/lib/config"
import { env } from "@/lib/env"
import { createRazorpayOrder } from "@/lib/razorpay/orders"

// POST /api/checkout/create-order
export async function POST(req: NextRequest) {
  // 10 orders per IP per minute — legitimate buyers won't hit this; bots will.
  const limited = await enforceRateLimit(req, "checkout", { max: 10, windowSec: 60 })
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

    // Resolve the buyer account.
    //
    // Three cases:
    //  (a) Logged-in user — use their session id.
    //  (b) Guest, but their email already maps to a user (seller or prior
    //      buyer) — link the order to that existing user. Do NOT create
    //      a duplicate account.
    //  (c) Brand-new email — create a buyer account so all future
    //      purchases on this email aggregate under one user, and so we
    //      can email them a "set up your password" link to claim it.
    const session = await auth()
    let buyerId: string | null = session?.user?.id ?? null
    let createdNewBuyer = false
    let passwordSetupToken: string | null = null

    if (!buyerId) {
      const [existing] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, buyerEmail))
        .limit(1)

      if (existing) {
        buyerId = existing.id
      } else {
        // Auto-create a buyer-only account. No password set yet —
        // the confirmation email will hand them a 24-hour token to
        // claim the account via the existing reset-password flow.
        passwordSetupToken = randomBytes(32).toString("hex")
        const passwordSetupExpiresAt = new Date(
          Date.now() + 24 * 60 * 60 * 1000,
        )
        const [newUser] = await db
          .insert(users)
          .values({
            email: buyerEmail,
            name: buyerName,
            role: "buyer",
            isSeller: false,
            emailVerified: false,
            passwordResetToken: passwordSetupToken,
            passwordResetExpiresAt: passwordSetupExpiresAt,
          })
          .returning({ id: users.id })

        buyerId = newUser.id
        createdNewBuyer = true
      }
    }

    // Block self-purchase. Sellers buying their own products would inflate
    // sales counts, distort revenue stats, and (in buyer-fee mode) cost
    // them the platform fee for no reason.
    if (buyerId && buyerId === storefront.userId) {
      return NextResponse.json(
        { error: "You can't purchase your own product." },
        { status: 400 }
      )
    }

    // Use the actual product file URL as the download link
    const downloadLink = product.deliveryType === "download" ? product.fileUrl : null

    // Generate a unique order number
    const orderNumber = `GZ-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

    // Create the Razorpay order first (authoritative amount, in paise). If
    // Razorpay is unreachable we fail BEFORE writing a half-born order.
    const rzp = await createRazorpayOrder({
      amountRupees: totalAmount,
      receipt: orderNumber,
      notes: { productId, sellerId: storefront.userId },
    })
    if (!rzp.ok) {
      console.error("[create-order] Razorpay order creation failed:", rzp.error)
      return NextResponse.json(
        { error: "Could not start payment. Please try again." },
        { status: 502 },
      )
    }

    // Atomic: payment row + order + item all succeed together. Stock is NOT
    // decremented here — that happens in fulfillOrder once payment is captured,
    // so an abandoned payment never consumes inventory.
    const { order } = await db.transaction(async (tx) => {
      const [createdPayment] = await tx
        .insert(payments)
        .values({
          buyerId,
          buyerEmail,
          razorpayOrderId: rzp.id,
          amount: String(totalAmount),
          currency: "INR",
          status: "created",
        })
        .returning()

      const [createdOrder] = await tx
        .insert(orders)
        .values({
          orderNumber,
          paymentId: createdPayment.id,
          sellerId: storefront.userId,
          buyerId,
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

      await tx.insert(orderItems).values({
        orderId: createdOrder.id,
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

      return { order: createdOrder }
    })

    return NextResponse.json(
      {
        orderId: order.id,
        orderNumber: order.orderNumber,
        razorpayOrderId: rzp.id,
        amount: rzp.amount, // paise — feed straight into the checkout modal
        currency: "INR",
        keyId: env.RAZORPAY_KEY_ID, // public key id — safe to send to the browser modal
        createdNewBuyer,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("POST /api/checkout/create-order error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
