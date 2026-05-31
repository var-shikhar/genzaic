import "server-only"
import { and, eq, lte, inArray } from "drizzle-orm"
import {
  db,
  notifications,
  notificationOutbox,
  userDevices,
  users,
} from "@/lib/db"
import { dispatchPush } from "./dispatchers/push"
import { dispatchEmail } from "./dispatchers/email"
import { nextAttemptDelayMs, MAX_ATTEMPTS } from "./backoff"

export type DispatchOutcome = "ok" | "fail" | "skip"

export function deriveNextStatus(args: {
  outcome: DispatchOutcome
  attempts: number
}): {
  status: "sent" | "failed" | "skipped" | "pending"
  attempts: number
  nextAttemptAt?: Date
} {
  if (args.outcome === "ok") {
    return { status: "sent", attempts: args.attempts }
  }
  if (args.outcome === "skip") {
    return { status: "skipped", attempts: args.attempts }
  }
  const nextAttempts = args.attempts + 1
  if (nextAttempts > MAX_ATTEMPTS) {
    return { status: "failed", attempts: nextAttempts }
  }
  return {
    status: "pending",
    attempts: nextAttempts,
    nextAttemptAt: new Date(Date.now() + nextAttemptDelayMs(nextAttempts)),
  }
}

export const BATCH_SIZE = 50

export type WorkerRow = {
  outboxId: string
  channel: "push" | "email"
  attempts: number
  notification: typeof notifications.$inferSelect
  user: { email: string; name: string | null }
}

export async function loadPendingBatch(): Promise<WorkerRow[]> {
  const rows = await db
    .select({
      outboxId: notificationOutbox.id,
      channel: notificationOutbox.channel,
      attempts: notificationOutbox.attempts,
      notification: notifications,
      user: { email: users.email, name: users.name },
    })
    .from(notificationOutbox)
    .innerJoin(notifications, eq(notifications.id, notificationOutbox.notificationId))
    .innerJoin(users, eq(users.id, notifications.userId))
    .where(
      and(
        eq(notificationOutbox.status, "pending"),
        lte(notificationOutbox.nextAttemptAt, new Date()),
      ),
    )
    .orderBy(notificationOutbox.nextAttemptAt)
    .limit(BATCH_SIZE)

  return rows
}

export async function processOutboxRow(row: WorkerRow): Promise<void> {
  let outcome: DispatchOutcome = "fail"
  let lastError: string | null = null
  try {
    if (row.channel === "email") {
      await dispatchEmail(row.notification, row.user)
      outcome = "ok"
    } else {
      const tokens = await db
        .select({ token: userDevices.fcmToken })
        .from(userDevices)
        .where(eq(userDevices.userId, row.notification.userId))
      if (tokens.length === 0) {
        outcome = "skip"
      } else {
        const result = await dispatchPush(
          row.notification,
          tokens.map((t) => t.token),
        )
        outcome = "ok"
        if (result.invalidTokens.length > 0) {
          await db
            .delete(userDevices)
            .where(inArray(userDevices.fcmToken, result.invalidTokens))
        }
      }
    }
  } catch (err) {
    outcome = "fail"
    lastError = err instanceof Error ? err.message : String(err)
  }

  const next = deriveNextStatus({ outcome, attempts: row.attempts })
  await db
    .update(notificationOutbox)
    .set({
      status: next.status,
      attempts: next.attempts,
      lastError,
      nextAttemptAt: next.nextAttemptAt ?? new Date(),
      sentAt: next.status === "sent" ? new Date() : null,
    })
    .where(eq(notificationOutbox.id, row.outboxId))
}
