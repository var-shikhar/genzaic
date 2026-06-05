import { NextRequest, NextResponse } from "next/server"
import { and, eq, ne } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { db, storefronts, storefrontDrafts } from "@/lib/db"
import {
  getDraftByIdForUser,
  getStorefrontByUser,
  countActiveProducts,
} from "@/lib/db/storefront-helpers"
import { invalidatePublicStorefrontBySlug } from "@/lib/data/public-storefront"
import type { PublishGateReason } from "@/lib/validations/storefront"

interface Ctx {
  params: Promise<{ id: string }>
}

const MIN_PRODUCTS_TO_PUBLISH = 2

function gateFail(reason: PublishGateReason, detail?: string) {
  return NextResponse.json(
    { error: "Publish gate failed", gate: reason, detail },
    { status: 422 },
  )
}

export async function POST(_req: NextRequest, ctx: Ctx) {
  const session = await auth()
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id as string
  const { id } = await ctx.params

  const draft = await getDraftByIdForUser(id, userId)
  if (!draft) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const live = await getStorefrontByUser(userId)
  const liveId = live?.id

  const c = draft.content

  // Gate 1: slug must be resolvable. If the draft didn't carry one (legacy
  // rows, or a freshly-created draft where the seller hasn't typed the
  // slug yet) but the seller already has a live store with a slug, fall
  // back to that — publishing keeps the existing public URL rather than
  // hard-failing on a missing field. Only error out if neither side has a
  // slug at all.
  const resolvedSlug =
    c.imprintSlug ?? live?.imprintSlug ?? live?.storeUrl ?? null
  if (!resolvedSlug) {
    return gateFail(
      "slug_invalid",
      "Set a store URL slug in section 01 — The Voice.",
    )
  }

  // Gate 1b: store name must be set. Same fallback chain as slug — drafts
  // that inherited from the live row will already have it.
  const resolvedName =
    c.imprintName?.trim() ||
    live?.imprintName?.trim() ||
    live?.storeName?.trim() ||
    null
  if (!resolvedName) {
    return gateFail(
      "name_required",
      "Add a store name in section 01 — The Voice.",
    )
  }

  // Gate 2: slug uniqueness across all other storefronts.
  const conflictCondition = liveId
    ? and(eq(storefronts.imprintSlug, resolvedSlug), ne(storefronts.id, liveId))
    : eq(storefronts.imprintSlug, resolvedSlug)
  const [slugTakenRow] = await db
    .select({ id: storefronts.id })
    .from(storefronts)
    .where(conflictCondition)
    .limit(1)
  if (slugTakenRow) return gateFail("slug_taken")

  // Gate 3: minimum active products. Needs a live storefront row to attach
  // products to — if none yet, the seller must create products first (which
  // bootstraps a row).
  if (!liveId) {
    return gateFail(
      "min_products",
      `At least ${MIN_PRODUCTS_TO_PUBLISH} active products are required to publish.`,
    )
  }
  const activeCount = await countActiveProducts(liveId)
  if (activeCount < MIN_PRODUCTS_TO_PUBLISH) {
    return gateFail(
      "min_products",
      `${activeCount} active product${activeCount === 1 ? "" : "s"} — need at least ${MIN_PRODUCTS_TO_PUBLISH}.`,
    )
  }

  // Promote: copy draft content onto the live row + set publishState.
  // Use the resolved slug so a draft with a null `imprintSlug` still
  // mirrors the right value onto both legacy + new columns.
  const nowTs = new Date()
  const dataToWrite = {
    imprintName: resolvedName,
    storeName: resolvedName,
    imprintSlug: resolvedSlug,
    storeUrl: resolvedSlug,
    imprintTagline: c.imprintTagline,
    tagline: c.imprintTagline,
    imprintEditorsNote: c.imprintEditorsNote,
    imprintCoverPreset: c.imprintCoverPreset,
    imprintTypePairing: c.imprintTypePairing,
    imprintAccent: c.imprintAccent,
    primaryColor: c.primaryColor ?? "#6366f1",
    showcase: c.showcase,
    socialInstagram: c.socialInstagram,
    socialTwitter: c.socialTwitter,
    socialYoutube: c.socialYoutube,
    socialWebsite: c.socialWebsite,
    profileImageUrl: c.profileImage?.url ?? live?.profileImageUrl ?? null,
    profileImageFileId: c.profileImage?.fileId ?? live?.profileImageFileId ?? null,
    coverImageUrl: c.coverImage?.url ?? live?.coverImageUrl ?? null,
    coverImageFileId: c.coverImage?.fileId ?? live?.coverImageFileId ?? null,
    publishState: "published" as const,
    isPublished: true,
    lastPublishedAt: nowTs,
    liveDraftId: draft.id,
    updatedAt: nowTs,
  }

  const [updated] = await db
    .update(storefronts)
    .set(dataToWrite)
    .where(eq(storefronts.userId, userId))
    .returning()

  // Lock resolved slug + name back into the draft so the editor doesn't
  // show blank fields on next load. Only writes when something was actually
  // missing — explicit user edits are never overwritten.
  if (!c.imprintSlug || !c.imprintName) {
    await db
      .update(storefrontDrafts)
      .set({
        content: {
          ...c,
          imprintSlug: resolvedSlug,
          imprintName: c.imprintName ?? resolvedName,
        },
        updatedAt: nowTs,
      })
      .where(eq(storefrontDrafts.id, draft.id))
  }

  // Cache busts on both new and previous slugs.
  if (updated?.storeUrl) invalidatePublicStorefrontBySlug(updated.storeUrl)
  if (live?.storeUrl && live.storeUrl !== updated?.storeUrl) {
    invalidatePublicStorefrontBySlug(live.storeUrl)
  }

  return NextResponse.json({ storefront: updated })
}
