import { NextRequest, NextResponse, after } from "next/server"
import { randomBytes } from "crypto"
import { db, products, storefronts, orders, orderItems, users } from "@/lib/db"
import { eq, and } from "drizzle-orm"
import { checkoutSchema } from "@/lib/validations/checkout"
import { auth } from "@/lib/auth"
import { enforceRateLimit } from "@/lib/rate-limit"
import { cache, cacheKeys } from "@/lib/cache"
import { PLATFORM_FEE_PERCENT, GST_RATE } from "@/lib/config"
import { issueOrderAccessToken } from "@/lib/order-access"
import { sendOrderConfirmationEmail } from "@/lib/email"
import { sendEmailWithRetry } from "@/lib/email/send-with-retry"
import { env } from "@/lib/env"

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

    // Atomic: order + orderItem + stock decrement all succeed together or
    // none do. Without this, a stock decrement failure (network blip after
    // the order insert) would leave a phantom paid order with un-decremented
    // inventory; or worse, two concurrent checkouts could oversell.
    const { order, item } = await db.transaction(async (tx) => {
      const [createdOrder] = await tx
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

      const [createdItem] = await tx
        .insert(orderItems)
        .values({
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
        .returning()

      if (product.stock !== null) {
        await tx
          .update(products)
          .set({ stock: product.stock - 1 })
          .where(eq(products.id, productId))
      }

      return { order: createdOrder, item: createdItem }
    })

    // Bust cached aggregations so the seller's dashboard reflects the new
    // order within 1 dashboard refresh instead of waiting for the 30s TTL.
    cache.delete(cacheKeys.salesStats(storefront.userId))
    cache.delete(cacheKeys.recentOrders(storefront.userId))

    // Mint two access tokens:
    //  - `checkout` (10 min): handed back in the response so the frontend
    //    can redirect the buyer straight to `/order/[id]?t=...`. Short-
    //    lived because they're standing on the success screen *right now*.
    //  - `email` (24 h): embedded in the confirmation email so they can
    //    come back later from their inbox. We send the email
    //    fire-and-forget with retry so a Resend hiccup doesn't fail the
    //    order, but a transient failure still gets retried 3x with backoff.
    const [checkoutToken, emailToken] = await Promise.all([
      issueOrderAccessToken(order.id, "checkout"),
      issueOrderAccessToken(order.id, "email"),
    ])

    const accessUrl = `${env.NEXT_PUBLIC_APP_URL}/order/${order.id}?t=${emailToken.token}`
    const passwordSetupUrl = passwordSetupToken
      ? `${env.NEXT_PUBLIC_APP_URL}/reset-password?token=${passwordSetupToken}`
      : undefined

    after(() =>
      sendEmailWithRetry(
        () =>
          sendOrderConfirmationEmail({
            buyerEmail,
            buyerName,
            productTitle: product.title,
            orderNumber: order.orderNumber,
            accessUrl,
            passwordSetupUrl,
          }),
        { label: "order-confirmation", to: buyerEmail },
      ).catch(() => {
        /* terminal failure already logged inside helper */
      }),
    )

    // Return a response shape that matches the frontend expectations
    return NextResponse.json(
      {
        id: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        status: order.status,
        deliveryType: item.deliveryType,
        items: [item],
        accessToken: checkoutToken.token,
        createdNewBuyer,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("POST /api/checkout/create-order error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
