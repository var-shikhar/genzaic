import Image from "next/image"
import {
  Globe,
  Instagram,
  Package,
  ShoppingCart,
  Twitter,
  Users,
  Youtube,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { themeFor } from "@/lib/store/theme"

// Maps the chosen typeface pairing (or legacy font name) to the body font
// stack the preview uses. The display font for headings is supplied separately
// via the `--font-store-display` CSS variable, set by the editor or page.
function resolveFontStack(name: string): string {
  switch (name) {
    // New pairing IDs — body always Inter Tight, display swaps via --font-store-display
    case "house":
    case "press":
    case "studio":
    case "plain":
      return "var(--font-body), system-ui, sans-serif"
    // Legacy names — kept for back-compat with old storefronts.
    case "Inter":
      return "var(--font-body), system-ui, sans-serif"
    default:
      return "var(--font-body), system-ui, sans-serif"
  }
}

const PAIRING_DISPLAY_VAR: Record<string, string> = {
  house:  "var(--font-display)",          // Fraunces
  press:  "var(--font-press-display)",    // Playfair Display
  studio: "var(--font-studio-display)",   // Space Grotesk
  plain:  "var(--font-plain-display)",    // DM Serif Display
}


export interface PreviewStorefront {
  storeName?: string | null
  tagline?: string | null
  description?: string | null
  profileImageUrl?: string | null
  coverImageUrl?: string | null
  themeId?: string | null
  primaryColor?: string | null
  fontFamily?: string | null
  socialInstagram?: string | null
  socialTwitter?: string | null
  socialYoutube?: string | null
  socialWebsite?: string | null
  seller?: {
    totalSales?: number
    followersCount?: number
  } | null
}

export interface PreviewProduct {
  id: string
  title: string
  price: string
  originalPrice?: string | null
  coverImageUrl?: string | null
}

interface StorefrontPreviewProps {
  storefront: PreviewStorefront
  products?: PreviewProduct[]
  hideBuyActions?: boolean
  showProducts?: boolean
}

export function StorefrontPreview({
  storefront,
  products = [],
  hideBuyActions = false,
  showProducts = true,
}: StorefrontPreviewProps) {
  const themeId = storefront.themeId ?? "modern"
  const themeColor = storefront.primaryColor ?? "#6366f1"
  const pairing = storefront.fontFamily ?? "house"
  const fontFamily = resolveFontStack(pairing)
  const displayFont = PAIRING_DISPLAY_VAR[pairing] ?? PAIRING_DISPLAY_VAR.house
  const t = themeFor(themeId, themeColor)

  return (
    <div
      className={cn("min-h-full", t.pageBg)}
      style={{
        fontFamily,
        // Headings inside this preview can opt into the chosen display
        // pairing via Tailwind's font-[var(--store-heading)] arbitrary value
        // or by setting fontFamily directly.
        ["--store-heading" as string]: `${displayFont}, Georgia, serif`,
      }}
    >
      <div
        className="h-32 md:h-40 relative"
        style={{
          background: storefront.coverImageUrl
            ? `url(${storefront.coverImageUrl}) center/cover`
            : t.coverGradient(themeColor),
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      <div className={cn("px-4 sm:px-6 relative z-10", t.hero)}>
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6">
          <div className="relative -top-8">
            <div
              className={cn(
                "relative w-20 h-20 sm:w-24 sm:h-24 border-4 overflow-hidden shrink-0",
                t.cornerRadius === "rounded-sm" ? "rounded-md" : "rounded-full",
              )}
              style={{ backgroundColor: themeColor, borderColor: themeColor }}
            >
              {storefront.profileImageUrl ? (
                <Image
                  src={storefront.profileImageUrl}
                  alt={storefront.storeName ?? ""}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">
                    {(storefront.storeName ?? "G").charAt(0)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left pb-3">
            <h1
              className={cn("text-xl sm:text-2xl", t.fontWeightHeading, t.heroText)}
              style={{ fontFamily: "var(--store-heading)" }}
            >
              {storefront.storeName || "Your Store"}
            </h1>
            <p className={cn("mt-1 text-sm", t.subText)}>
              {storefront.tagline ||
                storefront.description ||
                `Digital products by ${storefront.storeName || "your store"}`}
            </p>

            <div className={cn("flex items-center justify-center sm:justify-start gap-4 mt-2 text-xs", t.subText)}>
              {(storefront.seller?.totalSales ?? 0) > 0 && (
                <div className="flex items-center gap-1">
                  <ShoppingCart className="w-3 h-3" />
                  <span>{storefront.seller?.totalSales} sales</span>
                </div>
              )}
              {(storefront.seller?.followersCount ?? 0) > 0 && (
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>{storefront.seller?.followersCount} followers</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Package className="w-3 h-3" />
                <span>{products.length} products</span>
              </div>
            </div>

            {(storefront.socialInstagram ||
              storefront.socialTwitter ||
              storefront.socialYoutube ||
              storefront.socialWebsite) && (
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
                {storefront.socialInstagram && (
                  <span className={cn("p-1.5 rounded-full", t.productCard)}>
                    <Instagram className={cn("w-3 h-3", t.productCardText)} />
                  </span>
                )}
                {storefront.socialTwitter && (
                  <span className={cn("p-1.5 rounded-full", t.productCard)}>
                    <Twitter className={cn("w-3 h-3", t.productCardText)} />
                  </span>
                )}
                {storefront.socialYoutube && (
                  <span className={cn("p-1.5 rounded-full", t.productCard)}>
                    <Youtube className={cn("w-3 h-3", t.productCardText)} />
                  </span>
                )}
                {storefront.socialWebsite && (
                  <span className={cn("p-1.5 rounded-full", t.productCard)}>
                    <Globe className={cn("w-3 h-3", t.productCardText)} />
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showProducts && (
        <div className="px-4 sm:px-6 py-6">
          {products.length === 0 ? (
            <div
              className={cn("border-2 border-dashed p-8 text-center", t.cornerRadius, t.subText)}
              style={{ borderColor: `${themeColor}40` }}
            >
              <Package className="w-8 h-8 mx-auto mb-2 opacity-60" />
              <p className="text-sm">No products yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {products.map((p) => (
                <div
                  key={p.id}
                  className={cn("overflow-hidden border", t.cornerRadius, t.productCard)}
                >
                  <div className="aspect-video bg-black/10 relative">
                    {p.coverImageUrl ? (
                      <Image
                        src={p.coverImageUrl}
                        alt={p.title}
                        fill
                        sizes="200px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className={cn("w-6 h-6 opacity-40", t.productCardText)} />
                      </div>
                    )}
                  </div>
                  <div className="p-2.5">
                    <p
                      className={cn("text-xs font-medium truncate", t.productCardText)}
                      style={{ fontFamily: "var(--store-heading)" }}
                    >
                      {p.title}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={cn("text-sm", t.productPrice)}>
                        ₹{Number(p.price).toLocaleString("en-IN")}
                      </span>
                      {p.originalPrice && Number(p.originalPrice) > Number(p.price) && (
                        <span className={cn("text-xs line-through opacity-60", t.subText)}>
                          ₹{Number(p.originalPrice).toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                    {!hideBuyActions && (
                      <button
                        type="button"
                        className={cn("mt-2 w-full text-xs py-1.5 text-white", t.cornerRadius)}
                        style={{ backgroundColor: themeColor }}
                      >
                        Buy now
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
