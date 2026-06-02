import { NextRequest, NextResponse } from "next/server"
import { and, asc, eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { db, storefrontDrafts, type Storefront } from "@/lib/db"
import {
  draftCreateSchema,
  draftContentSchema,
  type DraftContent,
} from "@/lib/validations/storefront"
import {
  getDraftsByUser,
  getStorefrontByUser,
  isDraftNameTaken,
} from "@/lib/db/storefront-helpers"

/**
 * Produce a complete `DraftContent` blob. Starts from "all nulls + theme
 * defaults", layers the live storefront row on top (when present), then
 * applies any explicit overrides last. Used by POST and the default-draft
 * auto-provisioning in GET.
 */
function buildSeededContent(
  live: Storefront | null,
  overrides: Partial<DraftContent>,
): DraftContent {
  const liveSeed: Partial<DraftContent> = live
    ? {
        imprintName: live.imprintName ?? live.storeName ?? null,
        imprintSlug: live.imprintSlug ?? live.storeUrl ?? null,
        imprintTagline: live.imprintTagline ?? null,
        imprintEditorsNote: live.imprintEditorsNote ?? null,
        imprintCoverPreset: live.imprintCoverPreset,
        imprintTypePairing: live.imprintTypePairing,
        imprintAccent: live.imprintAccent,
        primaryColor: live.primaryColor ?? null,
        showcase: live.showcase ?? null,
        profileImage:
          live.profileImageUrl && live.profileImageFileId
            ? { url: live.profileImageUrl, fileId: live.profileImageFileId }
            : null,
        coverImage:
          live.coverImageUrl && live.coverImageFileId
            ? { url: live.coverImageUrl, fileId: live.coverImageFileId }
            : null,
        socialInstagram: live.socialInstagram ?? null,
        socialTwitter: live.socialTwitter ?? null,
        socialYoutube: live.socialYoutube ?? null,
        socialWebsite: live.socialWebsite ?? null,
      }
    : {}

  return draftContentSchema.parse({
    imprintName: null,
    imprintSlug: null,
    imprintTagline: null,
    imprintEditorsNote: null,
    imprintCoverPreset: "ink",
    imprintTypePairing: "house",
    imprintAccent: "iris",
    primaryColor: null,
    showcase: null,
    profileImage: null,
    coverImage: null,
    socialInstagram: null,
    socialTwitter: null,
    socialYoutube: null,
    socialWebsite: null,
    ...liveSeed,
    ...overrides,
  })
}

// GET — list current user's drafts. Guarantees the seller always has at
// least one draft AND that exactly one of their drafts is marked as the
// undeletable default. Two heal-on-read paths:
//
//   (a) empty list → auto-provision a "Default version" seeded from the
//       live storefront row.
//   (b) non-empty list with no default → mark the oldest existing draft
//       as the default. Covers users whose drafts were created before the
//       is_default column was added.
export async function GET() {
  const session = await auth()
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id as string

  let drafts = await getDraftsByUser(userId)

  if (drafts.length === 0) {
    const live = await getStorefrontByUser(userId)
    try {
      await db.insert(storefrontDrafts).values({
        userId,
        name: "Default version",
        description: "Auto-created from your current store. Cannot be deleted.",
        content: buildSeededContent(live, {}),
        isDefault: true,
      })
    } catch {
      // Unique index guards against a race where two concurrent GETs would
      // each try to insert a default — swallow the conflict and re-fetch.
    }
    drafts = await getDraftsByUser(userId)
  } else if (!drafts.some((d) => d.isDefault)) {
    // Heal-on-read for legacy drafts: promote the oldest existing row to
    // default so the seller can never end up in "no default exists" state.
    const [oldest] = await db
      .select({ id: storefrontDrafts.id })
      .from(storefrontDrafts)
      .where(eq(storefrontDrafts.userId, userId))
      .orderBy(asc(storefrontDrafts.createdAt))
      .limit(1)
    if (oldest) {
      try {
        await db
          .update(storefrontDrafts)
          .set({ isDefault: true })
          .where(eq(storefrontDrafts.id, oldest.id))
      } catch {
        // Same unique-index swallowing as above — concurrent heal is a no-op.
      }
      drafts = await getDraftsByUser(userId)
    }
  }

  return NextResponse.json({ drafts })
}

// POST — create a new (non-default) draft
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id as string

  const body = await req.json().catch(() => null)
  const parsed = draftCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    )
  }

  const name = parsed.data.name.trim()
  if (await isDraftNameTaken(userId, name)) {
    return NextResponse.json(
      {
        error: "Name already used",
        detail: `You already have a version named "${name}". Pick a different name.`,
      },
      { status: 409 },
    )
  }

  const live = parsed.data.seedFromLive
    ? await getStorefrontByUser(userId)
    : null
  const content = buildSeededContent(live, parsed.data.content ?? {})

  const [created] = await db
    .insert(storefrontDrafts)
    .values({
      userId,
      name,
      description: parsed.data.description ?? null,
      content,
    })
    .returning()

  return NextResponse.json({ draft: created }, { status: 201 })
}
