import { notFound } from "next/navigation"
import { and, eq, desc } from "drizzle-orm"
import { db, storefronts, products } from "@/lib/db"
import { getDraftByToken } from "@/lib/db/storefront-helpers"
import {
  StorefrontPreview,
  type PreviewProduct,
  type PreviewStorefront,
} from "@/components/store/StorefrontPreview"
import { DraftPreviewBanner } from "@/components/store/DraftPreviewBanner"
import { presetToThemeId } from "@/lib/store/theme"
import type { DraftContent } from "@/lib/validations/storefront"

// Token-based preview is always dynamic and never cached — share-link state
// can be revoked at any time, and the response is private to the link holder.
export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{ storeUrl: string; token: string }>
}

export default async function DraftPreviewByToken({ params }: Props) {
  const { token } = await params

  const draft = await getDraftByToken(token)
  if (!draft) notFound()

  const c = draft.content as DraftContent

  // Pull live products so the preview shows realistic catalogue alongside the
  // draft's design changes. Products belong to the live storefront row, not
  // the draft — drafts only carry presentation fields.
  const [liveRow] = await db
    .select({ id: storefronts.id })
    .from(storefronts)
    .where(eq(storefronts.userId, draft.userId))
    .limit(1)

  const liveProducts: PreviewProduct[] = liveRow
    ? await db
        .select({
          id: products.id,
          title: products.title,
          price: products.price,
          originalPrice: products.originalPrice,
          coverImageUrl: products.coverImageUrl,
        })
        .from(products)
        .where(
          and(
            eq(products.storefrontId, liveRow.id),
            eq(products.isActive, true),
          ),
        )
        .orderBy(desc(products.createdAt))
        .limit(12)
    : []

  const previewStore: PreviewStorefront = {
    storeName: c.imprintName ?? null,
    tagline: c.imprintTagline ?? null,
    description: c.imprintEditorsNote ?? null,
    profileImageUrl: c.profileImage?.url ?? null,
    coverImageUrl: c.coverImage?.url ?? null,
    themeId: presetToThemeId(c.imprintCoverPreset),
    primaryColor: c.primaryColor ?? "#6E37C7",
    fontFamily: c.imprintTypePairing,
    socialInstagram: c.socialInstagram,
    socialTwitter: c.socialTwitter,
    socialYoutube: c.socialYoutube,
    socialWebsite: c.socialWebsite,
    seller: null,
  }

  return (
    <>
      <DraftPreviewBanner label={draft.name} />
      <meta name="robots" content="noindex,nofollow" />
      <StorefrontPreview storefront={previewStore} products={liveProducts} hideBuyActions />
    </>
  )
}
