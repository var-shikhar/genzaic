import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { z } from "zod"
import { db, orders, orderItems, downloadLogs, products } from "@/lib/db"
import { auth } from "@/lib/auth"
import {
  verifyOrderAccessToken,
  markAccessTokenUsed,
} from "@/lib/order-access"
import { getSignedDownloadUrl } from "@/lib/file-storage"
import { enforceRateLimit } from "@/lib/rate-limit"

const bodySchema = z.object({
  token: z.string().nullable().optional(),
})

type RouteContext = { params: Promise<{ orderId: string }> }

/**
 * POST /api/checkout/order/[orderId]/download
 *
 * Authorises the caller (token OR session-as-buyer) and returns a
 * short-lived signed URL pointing at the actual file. The buyer's browser
 * opens that URL in a new tab to start the download — the URL itself dies
 * in 5 minutes, so even if it's captured from devtools it can't be
 * shared usefully.
 *
 * Also handles bookkeeping: increments download count, marks delivered,
 * inserts a downloadLogs row, bumps the global product download counter.
 */
export async function POST(req: NextRequest, { params }: RouteContext) {
  const limited = await enforceRateLimit(req, "order-download", {
    max: 20,
    windowSec: 60,
  })
  if (limited) return limited

  try {
    const { orderId } = await params
    const body = (await req.json().catch(() => ({}))) as unknown
    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1)

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // ─── Authorisation ──────────────────────────────────────────────────
    // Token in body OR an authenticated session that owns this order.
    let authorised = false
    const token = parsed.data.token ?? null

    if (token) {
      const check = await verifyOrderAccessToken(token)
      if (check.ok && check.orderId === order.id) {
        authorised = true
      }
    }

    if (!authorised) {
      const session = await auth()
      if (session?.user?.id && session.user.id === order.buyerId) {
        authorised = true
      }
    }

    if (!authorised) {
      return NextResponse.json(
        { error: "Access link expired or invalid" },
        { status: 401 },
      )
    }

    const [item] = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id))
      .limit(1)

    if (!item) {
      return NextResponse.json(
        { error: "Order item not found" },
        { status: 404 },
      )
    }

    if (item.deliveryType !== "download") {
      return NextResponse.json(
        { error: "This order is not a downloadable product" },
        { status: 400 },
      )
    }

    if (!item.downloadLink) {
      return NextResponse.json(
        { error: "Download not available" },
        { status: 404 },
      )
    }

    if (item.downloadCount >= item.maxDownloads) {
      return NextResponse.json(
        { error: "Download limit exceeded" },
        { status: 403 },
      )
    }

    // Sign a short-lived URL pointing at the actual file. 5 minute TTL —
    // enough for the browser to start the download but useless if leaked.
    const signedUrl = getSignedDownloadUrl(item.downloadLink, {
      ttlSeconds: 5 * 60,
    })

    // ─── Bookkeeping ────────────────────────────────────────────────────
    const forwarded = req.headers.get("x-forwarded-for")
    const ipAddress = forwarded
      ? forwarded.split(",")[0].trim()
      : req.headers.get("x-real-ip") ?? null
    const userAgent = req.headers.get("user-agent") ?? null

    await Promise.all([
      db.insert(downloadLogs).values({
        orderItemId: item.id,
        productTitle: item.productTitle,
        buyerName: order.buyerName,
        buyerEmail: order.buyerEmail,
        ipAddress,
        userAgent,
      }),
      db
        .update(orderItems)
        .set({
          downloadCount: item.downloadCount + 1,
          deliveryStatus: "delivered",
          updatedAt: new Date(),
        })
        .where(eq(orderItems.id, item.id)),
    ])

    // Mark token as used (audit). Doesn't disable it — the window is the
    // gate, not the use count — but useful for forensics.
    if (token) {
      markAccessTokenUsed(token).catch((err) => {
        console.warn("Failed to mark access token used:", err)
      })
    }

    // Bump global product downloads counter (best-effort).
    const [prod] = await db
      .select({ downloads: products.downloads })
      .from(products)
      .where(eq(products.id, item.productId))
      .limit(1)

    if (prod) {
      await db
        .update(products)
        .set({ downloads: prod.downloads + 1 })
        .where(eq(products.id, item.productId))
    }

    return NextResponse.json({ url: signedUrl })
  } catch (error) {
    console.error(
      "POST /api/checkout/order/[orderId]/download error:",
      error,
    )
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
