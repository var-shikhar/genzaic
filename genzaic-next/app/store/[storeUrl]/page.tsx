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
import { getPublicStorefront } from "@/lib/data/public-storefront"
import PublicProductBrowser from "@/components/store/PublicProductBrowser"
import { themeFor } from "@/lib/store/theme"
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
}

export default async function PublicStorefrontPage({ params }: PageProps) {
  const { storeUrl } = await params

  const result = await getPublicStorefront(storeUrl)
  if (result.kind !== "ok") {
    notFound()
  }
  const storefront = result.payload
  const products = storefront.products

  const themeId = storefront.themeId ?? "modern"
  const themeColor = storefront.primaryColor ?? "#073f7c"
  const fontFamily = storefront.fontFamily ?? "Inter"
  // Single source of truth — same mapping the editor preview uses, so what
  // a seller sees in the editor matches what visitors see on the public page.
  const t = themeFor(themeId, themeColor)

  return (
    <div className={cn("min-h-screen", t.pageBg)} style={{ fontFamily }}>
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
              <h1 className={cn("text-2xl sm:text-3xl", t.fontWeightHeading, t.heroText)}>
                {storefront.storeName}
              </h1>
              <p className={cn("mt-1", t.subText)}>
                {storefront.tagline ||
                  storefront.description ||
                  `Digital products by ${storefront.storeName}`}
              </p>

              <div className={cn("flex items-center justify-center sm:justify-start gap-6 mt-3 text-sm", t.subText)}>
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
