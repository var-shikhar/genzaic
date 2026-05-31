import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  Globe,
  Instagram,
  Package,
  ShoppingCart,
  Twitter,
  Users,
  Youtube,
} from "lucide-react"
import { auth } from "@/lib/auth"
import { and, eq, desc } from "drizzle-orm"
import { db, storefronts, products as productsTable } from "@/lib/db"
import { getPublicStorefront } from "@/lib/data/public-storefront"
import { getDraftByIdForUser } from "@/lib/db/storefront-helpers"
import PublicProductBrowser from "@/components/store/PublicProductBrowser"
import { ClosedStorePage } from "@/components/store/ClosedStorePage"
import { DraftPreviewBanner } from "@/components/store/DraftPreviewBanner"
import {
  StorefrontPreview,
  type PreviewProduct,
  type PreviewStorefront,
} from "@/components/store/StorefrontPreview"
import { ShowcaseSection } from "@/components/store/showcase/ShowcaseSection"
import type { StorefrontShowcase } from "@/lib/showcase/types"
import type { DraftContent } from "@/lib/validations/storefront"
import {
  themeFor,
  presetToThemeId,
  pairingDisplayFont,
  PAIRING_BODY_STACK,
} from "@/lib/store/theme"
import { cn } from "@/lib/utils"

// PERF: Server-render this page and let Next.js cache the rendered HTML for
// 60 seconds. Anonymous traffic (the bulk of storefront visits) will be served
// from the Next.js / Vercel cache without ever invoking the function. The
// inner data loader has its own in-memory cache that the SSR pass and the
// API route share, so even cold renders only hit Postgres once per slug per
// 2 minutes.
//
// Note: we deliberately do NOT call `auth()` here. Doing so would mark the
// page as dynamic and disable ISR. The `isOwnStore` check (used to hide the
// Buy button on the owner's own store) happens client-side inside
// `PublicProductBrowser` via `useSession()`.
export const revalidate = 60

interface PageProps {
  params: Promise<{ storeUrl: string }>
  searchParams: Promise<{ draft?: string }>
}

export default async function PublicStorefrontPage({
  params,
  searchParams,
}: PageProps) {
  const { storeUrl } = await params
  const { draft: draftId } = await searchParams

  // Owner-only draft preview: authenticated owner can preview their own
  // unpublished draft by appending ?draft=<id>.
  if (draftId) {
    const session = await auth()
    if (!session?.user) notFound()
    const draft = await getDraftByIdForUser(
      draftId,
      session.user.id as string,
    )
    if (!draft) notFound()
    const c = draft.content as DraftContent
    const [liveRow] = await db
      .select({ id: storefronts.id })
      .from(storefronts)
      .where(eq(storefronts.userId, draft.userId))
      .limit(1)
    const liveProducts: PreviewProduct[] = liveRow
      ? await db
          .select({
            id: productsTable.id,
            title: productsTable.title,
            price: productsTable.price,
            originalPrice: productsTable.originalPrice,
            coverImageUrl: productsTable.coverImageUrl,
          })
          .from(productsTable)
          .where(
            and(
              eq(productsTable.storefrontId, liveRow.id),
              eq(productsTable.isActive, true),
            ),
          )
          .orderBy(desc(productsTable.createdAt))
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
        <StorefrontPreview
          storefront={previewStore}
          products={liveProducts}
          hideBuyActions
        />
      </>
    )
  }

  const result = await getPublicStorefront(storeUrl)
  if (result.kind === "not_found") {
    notFound()
  }
  if (result.kind === "closed") {
    const c = result.payload
    return (
      <ClosedStorePage
        storeName={c.imprintName ?? c.storeName}
        headline={c.closedHeadline}
        message={c.closedMessage}
        showSocials={c.closedShowSocials}
        socials={c.socials}
        themeId={presetToThemeId(c.imprintCoverPreset)}
        primaryColor={c.primaryColor ?? "#073f7c"}
        typePairing={c.imprintTypePairing}
      />
    )
  }
  const storefront = result.payload
  const products = storefront.products

  // Derive theme + fonts from the imprint columns (the source of truth the
  // editor writes to). The legacy `themeId` / `fontFamily` columns are not
  // updated by the imprint editor and would otherwise leave the public page
  // stuck on the default "modern" theme regardless of what the seller picked.
  const themeId = presetToThemeId(storefront.imprintCoverPreset)
  const themeColor = storefront.primaryColor ?? "#073f7c"
  const displayFont = pairingDisplayFont(storefront.imprintTypePairing)
  const t = themeFor(themeId, themeColor)

  return (
    <div
      className={cn("min-h-screen", t.pageBg)}
      style={{
        fontFamily: PAIRING_BODY_STACK,
        ["--store-heading" as string]: `${displayFont}, Georgia, serif`,
      }}
    >
      {/* Header / Cover */}
      <div className={t.pageBg}>
        <div
          className="h-48 md:h-64 relative"
          style={{
            background: storefront.coverImageUrl
              ? `url(${storefront.coverImageUrl}) center/cover`
              : t.coverGradient(themeColor),
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6">
            <div className="relative -top-10">
              <div
                className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-background overflow-hidden shrink-0"
                style={{ backgroundColor: themeColor }}
              >
                {storefront.profileImageUrl ? (
                  <Image
                    src={storefront.profileImageUrl}
                    alt={storefront.storeName ?? ""}
                    fill
                    sizes="128px"
                    priority
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-4xl font-bold text-white">
                      {(storefront.storeName ?? "G").charAt(0)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left pb-4">
              <h1
                className={cn(
                  "text-2xl sm:text-3xl",
                  t.fontWeightHeading,
                  t.heroText,
                )}
                style={{ fontFamily: "var(--store-heading)" }}
              >
                {storefront.storeName}
              </h1>
              <p className={cn("mt-1", t.subText)}>
                {storefront.tagline ||
                  storefront.description ||
                  `Digital products by ${storefront.storeName}`}
              </p>

              <div
                className={cn(
                  "flex items-center justify-center sm:justify-start gap-6 mt-3 text-sm",
                  t.subText,
                )}
              >
                {(storefront.seller?.totalSales ?? 0) > 0 && (
                  <div className="flex items-center gap-1">
                    <ShoppingCart className="w-4 h-4" />
                    <span>{storefront.seller?.totalSales} sales</span>
                  </div>
                )}
                {(storefront.seller?.followersCount ?? 0) > 0 && (
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{storefront.seller?.followersCount} followers</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Package className="w-4 h-4" />
                  <span>{products.length} products</span>
                </div>
              </div>

              {(storefront.socialInstagram ||
                storefront.socialTwitter ||
                storefront.socialYoutube ||
                storefront.socialWebsite) && (
                <div className="flex items-center justify-center sm:justify-start gap-3 mt-4">
                  {storefront.socialInstagram && (
                    <a
                      href={`https://instagram.com/${storefront.socialInstagram.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                    >
                      <Instagram className="w-4 h-4" />
                    </a>
                  )}
                  {storefront.socialTwitter && (
                    <a
                      href={`https://twitter.com/${storefront.socialTwitter.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                    >
                      <Twitter className="w-4 h-4" />
                    </a>
                  )}
                  {storefront.socialYoutube && (
                    <a
                      href={storefront.socialYoutube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                    >
                      <Youtube className="w-4 h-4" />
                    </a>
                  )}
                  {storefront.socialWebsite && (
                    <a
                      href={storefront.socialWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                    >
                      <Globe className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Products — interactive client island */}
      <div className={t.pageBg}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <PublicProductBrowser
            storeUrl={storeUrl}
            themeColor={themeColor}
            products={products}
          />
        </div>
      </div>

      {/* Editorial section intro for the showcase. The divider rules and the
          showcase title/subtitle are intentionally one unit — visually
          announces "new section ahead" + tells the visitor what's coming, in
          a single beat. Renders only when there's actually a featured slot. */}
      {storefront.showcase &&
        (storefront.showcase as StorefrontShowcase).featured && (
          <div className={t.pageBg}>
            <div
              className={cn(
                "mx-auto max-w-6xl px-4 sm:px-6 pt-12 pb-8 sm:pt-16 sm:pb-10",
                t.subText,
              )}
            >
              {/* Tiny eyebrow above the title — sets the register. */}
              <p className="text-center font-mono text-[10px] uppercase tracking-[0.25em] opacity-70">
                Genzaic · presents
              </p>

              {/* Rule + title + rule. The rules use `bg-current` against the
                  parent subText shade, so it color-adapts to every theme. */}
              <div className="mt-4 flex items-center gap-4 sm:gap-6">
                <span
                  aria-hidden
                  className="h-px flex-1 bg-current opacity-20"
                />
                <h2
                  className={cn(
                    "text-center text-2xl sm:text-3xl md:text-4xl whitespace-nowrap",
                    t.fontWeightHeading,
                    t.heroText,
                  )}
                  style={{ fontFamily: "var(--store-heading)" }}
                >
                  {(storefront.showcase as StorefrontShowcase).title}
                </h2>
                <span
                  aria-hidden
                  className="h-px flex-1 bg-current opacity-20"
                />
              </div>

              {(storefront.showcase as StorefrontShowcase).subtitle && (
                <p className="mx-auto mt-3 max-w-xl text-center text-sm italic sm:text-base">
                  {(storefront.showcase as StorefrontShowcase).subtitle}
                </p>
              )}

              {/* Scroll-cue ornament — a stacked pair of dots that gently
                  signals "more below". Decorative; no animation so it doesn't
                  distract from the embeds. */}
              <div className="mt-6 flex items-center justify-center gap-1.5">
                <span
                  aria-hidden
                  className="h-1 w-1 rounded-full bg-current opacity-60"
                />
                <span
                  aria-hidden
                  className="h-1 w-1 rounded-full bg-current opacity-40"
                />
                <span
                  aria-hidden
                  className="h-1 w-1 rounded-full bg-current opacity-20"
                />
              </div>
            </div>
          </div>
        )}

      {/* Watch & Follow — creator's video showcase. Sits AFTER products so
          shoppers see the catalogue first; the section's own bg is
          transparent so the parent `t.pageBg` carries the theme through. The
          title + subtitle live in the divider above, not inside the section. */}
      <div className={t.pageBg}>
        <ShowcaseSection
          showcase={(storefront.showcase as StorefrontShowcase | null) ?? null}
          subTextClassName={t.subText}
        />
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm text-muted-foreground">
            Powered by{" "}
            <Link
              href="/"
              className="font-semibold text-primary hover:underline"
            >
              GenZaic
            </Link>
          </p>
        </div>
      </footer>
    </div>
  )
}
