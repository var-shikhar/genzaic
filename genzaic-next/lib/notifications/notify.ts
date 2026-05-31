import "server-only"
import { and, eq } from "drizzle-orm"
import {
  db,
  notifications,
  notificationOutbox,
  notificationPreferences,
  users,
  type Notification,
} from "@/lib/db"
import { processOutboxRow, type WorkerRow } from "./worker"

type NotificationType = Notification["type"]

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0]

export type NotifyInput = {
  userId: string
  type: NotificationType
  title: string
  message: string
  link?: string
  metadata?: Record<string, unknown>
  /** Use when an existing inline flow already handles a channel. */
  suppress?: { email?: boolean; push?: boolean }
  /**
   * Dispatch options. By default we try to send push + email immediately
   * after the row is recorded, so the user gets the push in seconds instead
   * of waiting up to a cron tick. Set `inline: false` for fan-out cases
   * (e.g. broadcast to all users) where sequential blocking sends would
   * stall the calling route.
   */
  inline?: boolean
}

type CreatedOutboxRow = {
  id: string
  channel: "push" | "email"
  attempts: number
}

async function getOrCreatePrefs(
  tx: Tx,
  userId: string,
  type: NotificationType,
): Promise<{ inAppEnabled: boolean; emailEnabled: boolean }> {
  const existing = await tx
    .select({
      inAppEnabled: notificationPreferences.inAppEnabled,
      emailEnabled: notificationPreferences.emailEnabled,
    })
    .from(notificationPreferences)
    .where(
      and(
        eq(notificationPreferences.userId, userId),
        eq(notificationPreferences.notificationType, type),
      ),
    )
    .limit(1)

  if (existing.length > 0) return existing[0]

  const [created] = await tx
    .insert(notificationPreferences)
    .values({
      userId,
      notificationType: type,
      inAppEnabled: true,
      emailEnabled: true,
    })
    .returning({
      inAppEnabled: notificationPreferences.inAppEnabled,
      emailEnabled: notificationPreferences.emailEnabled,
    })
  return created
}

/**
 * Records a notification and, by default, attempts to deliver it on the
 * spot — so push/email arrive in seconds rather than after the next cron
 * tick. The outbox row is still the durable record: if the inline attempt
 * fails (transient FCM/SMTP error, missing creds, no devices yet), the row
 * stays `pending` and the cron worker retries with backoff. Successful
 * inline sends mark the row `sent` so cron won't double-dispatch.
 *
 * Callers can pass `inline: false` to opt out — useful for broadcasts where
 * doing N synchronous sends would block the request.
 */
export async function notifyEvent(input: NotifyInput): Promise<Notification> {
  const { notification, outboxRows } = await db.transaction(async (tx) => {
    const [n] = await tx
      .insert(notifications)
      .values({
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        link: input.link,
        metadata: input.metadata,
      })
      .returning()

    const prefs = await getOrCreatePrefs(tx, input.userId, input.type)

    const rows: Array<{ notificationId: string; channel: "push" | "email" }> = []
    if (prefs.inAppEnabled && !input.suppress?.push) {
      rows.push({ notificationId: n.id, channel: "push" })
    }
    if (prefs.emailEnabled && !input.suppress?.email) {
      rows.push({ notificationId: n.id, channel: "email" })
    }

    let inserted: CreatedOutboxRow[] = []
    if (rows.length > 0) {
      inserted = await tx
        .insert(notificationOutbox)
        .values(rows)
        .returning({
          id: notificationOutbox.id,
          channel: notificationOutbox.channel,
          attempts: notificationOutbox.attempts,
        })
    }

    return { notification: n, outboxRows: inserted }
  })

  const wantsInline = input.inline !== false
  if (wantsInline && outboxRows.length > 0) {
    await dispatchInline(notification, input.userId, outboxRows).catch((err) => {
      // Non-fatal: the row is still pending and cron will retry. Just log
      // the underlying reason so dev sees why immediate delivery missed.
      console.warn("[notify] inline dispatch error (cron will retry):", err)
    })
  }

  return notification
}

/**
 * Inline path that mirrors what the cron worker does, but for the specific
 * outbox rows we just created. Reuses `processOutboxRow` so retry/backoff
 * accounting stays in one place — a failed inline send marks the row
 * `pending` with a future `nextAttemptAt`, which cron picks up later.
 */
async function dispatchInline(
  notification: Notification,
  userId: string,
  rows: CreatedOutboxRow[],
): Promise<void> {
  // Email needs the user record; push reads tokens directly inside
  // processOutboxRow. Skip the lookup if nothing here is email-bound.
  const needsUser = rows.some((r) => r.channel === "email")
  let user: { email: string; name: string | null } | null = null
  if (needsUser) {
    const [u] = await db
      .select({ email: users.email, name: users.name })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
    user = u ?? null
  }

  for (const r of rows) {
    if (r.channel === "email" && !user) continue
    const workerRow: WorkerRow = {
      outboxId: r.id,
      channel: r.channel,
      attempts: r.attempts,
      notification,
      user: user ?? { email: "", name: null },
    }
    await processOutboxRow(workerRow).catch((err) => {
      console.warn(
        `[notify] inline ${r.channel} dispatch failed for outbox ${r.id}:`,
        err,
      )
    })
  }
}
