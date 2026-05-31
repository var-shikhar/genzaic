import { NextRequest, NextResponse } from "next/server"
import { and, desc, eq, ne } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { db, storefrontDrafts, storefronts } from "@/lib/db"
import { draftSaveSchema } from "@/lib/validations/storefront"
import {
  getDraftByIdForUser,
  getStorefrontByUser,
  isDraftNameTaken,
} from "@/lib/db/storefront-helpers"
import { invalidatePublicStorefrontBySlug } from "@/lib/data/public-storefront"

interface Ctx {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  const session = await auth()
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await ctx.params
  const draft = await getDraftByIdForUser(id, session.user.id as string)
  if (!draft) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ draft })
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const session = await auth()
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id as string
  const { id } = await ctx.params

  const existing = await getDraftByIdForUser(id, userId)
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 })

  const body = await req.json().catch(() => null)
  const parsed = draftSaveSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    )
  }

  // Block rename to a name owned by another of the seller's drafts. The
  // check is skipped when the name isn't changing (or is being reset to
  // the same string), so PATCH-without-rename never trips on itself.
  const nextName = (parsed.data.name ?? existing.name).trim()
  if (
    nextName !== existing.name &&
    (await isDraftNameTaken(userId, nextName, id))
  ) {
    return NextResponse.json(
      {
        error: "Name already used",
        detail: `You already have a version named "${nextName}". Pick a different name.`,
      },
      { status: 409 },
    )
  }

  // Merge partial content into the existing blob — never overwrite to a
  // half-populated object.
  const nextContent = parsed.data.content
    ? { ...existing.content, ...parsed.data.content }
    : existing.content

  const [updated] = await db
    .update(storefrontDrafts)
    .set({
      name: nextName,
      description:
        parsed.data.description !== undefined
          ? parsed.data.description
          : existing.description,
      content: nextContent,
      updatedAt: new Date(),
    })
    .where(eq(storefrontDrafts.id, id))
    .returning()

  return NextResponse.json({ draft: updated })
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const session = await auth()
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id as string
  const { id } = await ctx.params

  const existing = await getDraftByIdForUser(id, userId)
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 })

  // The default version is undeletable — it's the seller's fallback floor
  // for the editor and the publish flow.
  if (existing.isDefault) {
    return NextResponse.json(
      { error: "The default version cannot be deleted." },
      { status: 409 },
    )
  }

  const live = await getStorefrontByUser(userId)
  const isLive = live?.liveDraftId === id

  // When the live draft is being deleted, promote the next-most-recently-
  // updated draft (excluding the one being deleted) onto the live storefront
  // row before the delete happens. This keeps the public store online with
  // the successor's content rather than orphaning a now-deleted row.
  if (isLive && live) {
    const [successor] = await db
      .select()
      .from(storefrontDrafts)
      .where(
        and(eq(storefrontDrafts.userId, userId), ne(storefrontDrafts.id, id)),
      )
      .orderBy(desc(storefrontDrafts.updatedAt))
      .limit(1)

    if (successor) {
      const c = successor.content
      const nowTs = new Date()
      await db
        .update(storefronts)
        .set({
          imprintName: c.imprintName,
          storeName: c.imprintName,
          imprintSlug: c.imprintSlug,
          storeUrl: c.imprintSlug,
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
          profileImageUrl: c.profileImage?.url ?? null,
          profileImageFileId: c.profileImage?.fileId ?? null,
          coverImageUrl: c.coverImage?.url ?? null,
          coverImageFileId: c.coverImage?.fileId ?? null,
          publishState: "published" as const,
          isPublished: true,
          lastPublishedAt: nowTs,
          liveDraftId: successor.id,
          updatedAt: nowTs,
        })
        .where(eq(storefronts.userId, userId))
      if (live.storeUrl) invalidatePublicStorefrontBySlug(live.storeUrl)
    } else {
      // No successor — clear the live pointer so the storefronts row no
      // longer references a draft that's about to disappear. The store
      // itself stays published (with the old content already mirrored on
      // the row) until the seller acts again.
      await db
        .update(storefronts)
        .set({ liveDraftId: null, updatedAt: new Date() })
        .where(eq(storefronts.userId, userId))
    }
  }

  await db.delete(storefrontDrafts).where(eq(storefrontDrafts.id, id))
  return NextResponse.json({
    ok: true,
    successorPublished: isLive,
  })
}
