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
  thumbnailUrl?: string | null
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
  const themeColor = storefront.primaryColor ?? "#073f7c"
  const fontFamily = storefront.fontFamily ?? "Inter"
  const themeBg = themeId === "minimal" ? "#f8fafc" : themeColor
  const isLight = themeId === "minimal"

  return (
    <div className="bg-background" style={{ fontFamily }}>
      <div style={{ backgroundColor: themeBg }}>
        <div
          className="h-32 md:h-40 relative"
          style={{
            background: storefront.coverImageUrl
              ? `url(${storefront.coverImageUrl}) center/cover`
              : `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        </div>

        <div className="px-4 sm:px-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6">
            <div className="relative -top-8">
              <div
                className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-background overflow-hidden shrink-0"
                style={{ backgroundColor: themeColor }}
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
                className="text-xl sm:text-2xl font-bold"
                style={{ color: isLight ? "#1f2937" : "#f9fafb" }}
              >
                {storefront.storeName || "Your Store"}
              </h1>
              <p
                style={{ color: isLight ? "#6b7280" : "#d1d5db" }}
                className="mt-1 text-sm"
              >
                {storefront.tagline ||
                  storefront.description ||
                  `Digital products by ${storefront.storeName || "your store"}`}
              </p>

              <div
                className="flex items-center justify-center sm:justify-start gap-4 mt-2 text-xs"
                style={{ color: isLight ? "#6b7280" : "#d1d5db" }}
              >
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
                    <span className="p-1.5 rounded-full bg-muted">
                      <Instagram className="w-3 h-3" />
                    </span>
                  )}
                  {storefront.socialTwitter && (
                    <span className="p-1.5 rounded-full bg-muted">
                      <Twitter className="w-3 h-3" />
                    </span>
                  )}
                  {storefront.socialYoutube && (
                    <span className="p-1.5 rounded-full bg-muted">
                      <Youtube className="w-3 h-3" />
                    </span>
                  )}
                  {storefront.socialWebsite && (
                    <span className="p-1.5 rounded-full bg-muted">
                      <Globe className="w-3 h-3" />
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showProducts && (
        <div style={{ backgroundColor: themeBg }}>
          <div className="px-4 sm:px-6 py-6">
            {products.length === 0 ? (
              <div
                className="rounded-xl border-2 border-dashed border-muted-foreground/20 p-8 text-center"
                style={{ color: isLight ? "#6b7280" : "#d1d5db" }}
              >
                <Package className="w-8 h-8 mx-auto mb-2 opacity-60" />
                <p className="text-sm">No products yet — your store appears empty.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-lg overflow-hidden border bg-card"
                  >
                    <div className="aspect-video bg-muted relative">
                      {p.thumbnailUrl ? (
                        <Image
                          src={p.thumbnailUrl}
                          alt={p.title}
                          fill
                          sizes="200px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-medium truncate">{p.title}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-sm font-semibold">
                          ₹{Number(p.price).toLocaleString("en-IN")}
                        </span>
                        {p.originalPrice && Number(p.originalPrice) > Number(p.price) && (
                          <span className="text-xs text-muted-foreground line-through">
                            ₹{Number(p.originalPrice).toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                      {!hideBuyActions && (
                        <button
                          type="button"
                          className="mt-2 w-full text-xs py-1 rounded text-white"
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
        </div>
      )}
    </div>
  )
}
