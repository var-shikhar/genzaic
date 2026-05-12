import { eq } from "drizzle-orm"
import { db, storefronts } from "@/lib/db"

/** Fetch the full storefront row for a given user, or `null` if none exists. */
export async function getStorefrontByUser(userId: string) {
  const [sf] = await db
    .select()
    .from(storefronts)
    .where(eq(storefronts.userId, userId))
    .limit(1)
  return sf ?? null
}
