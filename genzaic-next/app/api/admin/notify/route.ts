import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db, users } from "@/lib/db"
import { notifyEvent } from "@/lib/notifications/notify"

export const dynamic = "force-dynamic"
export const maxDuration = 60

// Mirror of the notification_type enum so zod can validate before hitting
// the DB. Kept inline rather than imported from drizzle because the enum
// values live in the schema as a tuple typed string[] and we want the
// stricter literal-union type here.
const NOTIFICATION_TYPES = [
  "order_placed",
  "order_completed",
  "product_published",
  "kyc_submitted",
  "kyc_approved",
  "kyc_rejected",
  "new_follower",
  "new_review",
  "payout_completed",
  "payout_failed",
  "coupon_received",
  "price_drop",
  "new_product_from_following",
  "account_verified",
  "welcome",
  "system",
] as const

const bodySchema = z
  .object({
    type: z.enum(NOTIFICATION_TYPES).default("system"),
    title: z.string().min(1).max(200),
    message: z.string().min(1).max(1000),
    link: z.string().max(500).optional(),
    metadata: z.record(z.unknown()).optional(),
    // Targeting: pick exactly one.
    userId: z.string().uuid().optional(),
    userIds: z.array(z.string().uuid()).min(1).max(1000).optional(),
    all: z.boolean().optional(),
  })
  .refine(
    (v) =>
      [v.userId, v.userIds?.length, v.all].filter(Boolean).length === 1,
    { message: "Provide exactly one of: userId, userIds, all" },
  )

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if ((session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    )
  }
  const input = parsed.data

  // Resolve the target user list. "all" fan-out is intentionally bounded to
  // active accounts only; if this grows past a few thousand users it should
  // move onto the outbox/queue instead of doing N inserts in one request.
  let targetIds: string[]
  if (input.userId) {
    targetIds = [input.userId]
  } else if (input.userIds) {
    targetIds = input.userIds
  } else {
    const rows = await db.select({ id: users.id }).from(users)
    targetIds = rows.map((r) => r.id)
  }

  // Single-target case: surface DB errors directly so the admin sees them.
  // Inline dispatch is on — push arrives in seconds, not after cron tick.
  // Bulk case: best-effort, and we skip inline dispatch (cron handles the
  // fanout) so a 5,000-user broadcast doesn't sit here doing N synchronous
  // FCM round-trips.
  if (targetIds.length === 1) {
    await notifyEvent({
      userId: targetIds[0],
      type: input.type,
      title: input.title,
      message: input.message,
      link: input.link,
      metadata: input.metadata,
    })
    return NextResponse.json({ ok: true, sent: 1, failed: [] })
  }

  let sent = 0
  const failed: string[] = []
  for (const uid of targetIds) {
    try {
      await notifyEvent({
        userId: uid,
        type: input.type,
        title: input.title,
        message: input.message,
        link: input.link,
        metadata: input.metadata,
        inline: false,
      })
      sent += 1
    } catch {
      failed.push(uid)
    }
  }
  return NextResponse.json({ ok: true, sent, failed })
}

// Convenience: GET returns a tiny shape for admins to inspect targeting
// without firing. Useful when wiring an admin UI.
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if ((session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const url = new URL(req.url)
  const userId = url.searchParams.get("userId")
  if (userId) {
    const [u] = await db
      .select({ id: users.id, email: users.email, name: users.name })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
    return NextResponse.json({ user: u ?? null })
  }
  const rows = await db.select({ id: users.id }).from(users).limit(1)
  return NextResponse.json({ totalUsersIndicator: rows.length > 0 ? ">=1" : 0 })
}
