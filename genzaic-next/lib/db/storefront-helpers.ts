import { and, eq, desc, count } from "drizzle-orm"
import { db, storefronts, storefrontDrafts, products } from "@/lib/db"

/** Fetch the full storefront row for a given user, or `null` if none exists. */
export async function getStorefrontByUser(userId: string) {
  const [sf] = await db
    .select()
    .from(storefronts)
    .where(eq(storefronts.userId, userId))
    .limit(1)
  return sf ?? null
}

/** List a seller's drafts, newest-updated first. */
export async function getDraftsByUser(userId: string) {
  return db
    .select()
    .from(storefrontDrafts)
    .where(eq(storefrontDrafts.userId, userId))
    .orderBy(desc(storefrontDrafts.updatedAt))
}

/**
 * Get a single draft and assert ownership in the same query. Returns null if
 * the row doesn't exist OR the user doesn't own it — callers should treat
 * null as 404.
 */
export async function getDraftByIdForUser(id: string, userId: string) {
  const [row] = await db
    .select()
    .from(storefrontDrafts)
    .where(
      and(eq(storefrontDrafts.id, id), eq(storefrontDrafts.userId, userId)),
    )
    .limit(1)
  return row ?? null
}

/**
 * Look up a draft by its public preview token. No ownership check — the
 * token itself is the credential.
 */
export async function getDraftByToken(token: string) {
  const [row] = await db
    .select()
    .from(storefrontDrafts)
    .where(eq(storefrontDrafts.previewToken, token))
    .limit(1)
  return row ?? null
}

/**
 * Count active products on a storefront — used by the publish gate
 * ("min 2 active products to publish").
 */
export async function countActiveProducts(
  storefrontId: string,
): Promise<number> {
  const [row] = await db
    .select({ n: count() })
    .from(products)
    .where(
      and(eq(products.storefrontId, storefrontId), eq(products.isActive, true)),
    )
  return Number(row?.n ?? 0)
}

/**
 * Checks whether the given user already owns a draft with this name.
 * `excludeId` lets a PATCH skip the conflict check when the name isn't
 * actually changing (or is changing back to the same value).
 */
export async function isDraftNameTaken(
  userId: string,
  name: string,
  excludeId?: string,
): Promise<boolean> {
  const rows = await db
    .select({ id: storefrontDrafts.id })
    .from(storefrontDrafts)
    .where(
      and(eq(storefrontDrafts.userId, userId), eq(storefrontDrafts.name, name)),
    )
    .limit(2)
  return rows.some((r) => r.id !== excludeId)
}
