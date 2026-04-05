import { NextRequest, NextResponse } from "next/server"
import { db, orders, downloadLogs, products } from "@/lib/db"
import { eq } from "drizzle-orm"
import { z } from "zod"

const recordDownloadSchema = z.object({
  orderId: z.string().uuid("Invalid order ID"),
})

// POST /api/checkout/record-download - record a download event
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = recordDownloadSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { orderId } = parsed.data

    const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1)
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })

    if (order.deliveryType !== "download") {
      return NextResponse.json({ error: "This order is not a downloadable product" }, { status: 400 })
    }

    if (order.downloadCount >= order.maxDownloads) {
      return NextResponse.json({ error: "Download limit exceeded" }, { status: 403 })
    }

    // Get IP and user agent from headers
    const forwarded = req.headers.get("x-forwarded-for")
    const ipAddress = forwarded ? forwarded.split(",")[0].trim() : req.headers.get("x-real-ip") ?? null
    const userAgent = req.headers.get("user-agent") ?? null

    // Record the download log entry
    await db.insert(downloadLogs).values({
      orderId,
      productTitle: order.productTitle,
      buyerName: order.buyerName,
      buyerEmail: order.buyerEmail,
      ipAddress,
      userAgent,
    })

    // Increment download count on order and mark as delivered
    await db
      .update(orders)
      .set({
        downloadCount: order.downloadCount + 1,
        deliveryStatus: "delivered",
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId))

    // Increment global product downloads counter
    const [prod] = await db
      .select({ downloads: products.downloads })
      .from(products)
      .where(eq(products.id, order.productId))
      .limit(1)

    if (prod) {
      await db
        .update(products)
        .set({ downloads: prod.downloads + 1 })
        .where(eq(products.id, order.productId))
    }

    return NextResponse.json({ message: "Download recorded" })
  } catch (error) {
    console.error("POST /api/checkout/record-download error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
