import "server-only"
import { randomBytes } from "crypto"
import { eq } from "drizzle-orm"
import { db, orderAccessTokens, type OrderAccessToken } from "@/lib/db"

/**
 * How long a freshly-issued access token is valid for.
 *
 * Two flavours:
 *  - `checkout`: handed to the buyer in the URL right after checkout. Short
 *    window because they're standing on the success page right now and just
 *    need to grab the file. Stops a screenshot-shared URL from being usable
 *    by a third party an hour later.
 *  - `email`: handed out in the order-confirmation email. Longer window
 *    because the buyer might open the email later. Still finite — if they
 *    want indefinite access they can set up a password and log in.
 */
export const ACCESS_TOKEN_TTL = {
  checkout: 10 * 60 * 1000, // 10 minutes
  email: 24 * 60 * 60 * 1000, // 24 hours
} as const

export type AccessTokenKind = keyof typeof ACCESS_TOKEN_TTL

/**
 * Mints a new access token for an order. Returns the raw token string —
 * the caller is responsible for putting it in the URL / email body. Tokens
 * are stored verbatim (not hashed) which is acceptable for short-lived,
 * orderId-scoped, single-purpose bearer tokens; if we ever extend their
 * scope or TTL meaningfully, hash before storage.
 */
export async function issueOrderAccessToken(
  orderId: string,
  kind: AccessTokenKind,
): Promise<{ token: string; expiresAt: Date }> {
  const token = randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + ACCESS_TOKEN_TTL[kind])

  await db.insert(orderAccessTokens).values({
    orderId,
    token,
    expiresAt,
  })

  return { token, expiresAt }
}

export type AccessTokenCheck =
  | { ok: true; orderId: string }
  | { ok: false; reason: "not_found" | "expired" }

/**
 * Look up a token and verify it's still valid. Does NOT mark it as used —
 * callers can refresh the same /order page while the window is open without
 * burning the token. We record `usedAt` lazily on the first download click
 * (see `markAccessTokenUsed`) for audit only; expiry is what gates access.
 */
export async function verifyOrderAccessToken(
  token: string,
): Promise<AccessTokenCheck> {
  if (!token) return { ok: false, reason: "not_found" }

  const [row]: OrderAccessToken[] = await db
    .select()
    .from(orderAccessTokens)
    .where(eq(orderAccessTokens.token, token))
    .limit(1)

  if (!row) return { ok: false, reason: "not_found" }
  if (row.expiresAt.getTime() < Date.now()) {
    return { ok: false, reason: "expired" }
  }

  return { ok: true, orderId: row.orderId }
}

/**
 * Records the first time a token was used to fetch a file. Audit-only —
 * we don't disable the token after first use because a download attempt
 * might race a page reload (browser preflight + actual GET), and we don't
 * want the second request to 401.
 */
export async function markAccessTokenUsed(token: string): Promise<void> {
  await db
    .update(orderAccessTokens)
    .set({ usedAt: new Date() })
    .where(eq(orderAccessTokens.token, token))
}
