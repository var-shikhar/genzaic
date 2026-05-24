import "server-only"
import { getFirebaseAdmin } from "@/lib/firebase/admin"
import { env } from "@/lib/env"
import type { Notification } from "@/lib/db"

export type PushResult = {
  sentCount: number
  invalidTokens: string[]
}

const TRANSIENT_ERROR_CODES = new Set([
  "messaging/internal-error",
  "messaging/server-unavailable",
  "messaging/unavailable",
  "messaging/quota-exceeded",
])

const INVALID_TOKEN_CODES = new Set([
  "messaging/registration-token-not-registered",
  "messaging/invalid-registration-token",
  "messaging/invalid-argument",
])

function absoluteLink(link: string | null | undefined): string {
  const base = env.NEXT_PUBLIC_APP_URL
  return new URL(link ?? "/notifications", base).toString()
}

export async function dispatchPush(
  notif: Notification,
  tokens: string[],
): Promise<PushResult> {
  if (tokens.length === 0) return { sentCount: 0, invalidTokens: [] }

  const { messaging } = getFirebaseAdmin()
  const response = await messaging.sendEachForMulticast({
    tokens,
    notification: { title: notif.title, body: notif.message },
    data: {
      notificationId: notif.id,
      type: notif.type,
      link: notif.link ?? "/notifications",
    },
    webpush: {
      fcmOptions: {
        link: absoluteLink(notif.link),
      },
    },
  })

  const invalidTokens: string[] = []
  let transientFailure = false

  response.responses.forEach((r, i) => {
    if (r.success) return
    const code = (r.error as { code?: string } | undefined)?.code ?? ""
    if (INVALID_TOKEN_CODES.has(code)) {
      invalidTokens.push(tokens[i])
    } else if (TRANSIENT_ERROR_CODES.has(code)) {
      transientFailure = true
    }
  })

  // If every send failed and at least one was transient, propagate so the
  // worker retries with backoff. Mixed outcomes (some sent, some bad tokens)
  // succeed — we just prune the bad tokens.
  if (response.successCount === 0 && transientFailure) {
    throw new Error(`FCM transient failure: ${response.failureCount} failed`)
  }

  return { sentCount: response.successCount, invalidTokens }
}
