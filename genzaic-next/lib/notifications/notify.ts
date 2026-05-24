import "server-only"
import { and, eq } from "drizzle-orm"
import {
  db,
  notifications,
  notificationOutbox,
  notificationPreferences,
  type Notification,
} from "@/lib/db"

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

export async function notifyEvent(input: NotifyInput): Promise<Notification> {
  return db.transaction(async (tx) => {
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
    if (rows.length > 0) await tx.insert(notificationOutbox).values(rows)

    return n
  })
}
