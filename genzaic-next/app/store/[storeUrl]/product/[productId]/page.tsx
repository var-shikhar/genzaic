import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import {
  ArrowLeft, Download, ExternalLink, Mail, ShoppingCart,
  Share2, Heart, Package, Star,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatCurrency } from "@/lib/utils"
import { getPublicStorefrontProduct } from "@/lib/data/public-storefront"
import { BuyButton } from "@/components/storefront/BuyButton"

// PERF: Cache the rendered HTML for 60 seconds. Anonymous traffic gets served
// from the Next.js cache without invoking the function. The data loader has
// its own in-memory cache shared with the API route so cold renders only hit
// Postgres once per (slug, productId) per cache window.
export const revalidate = 60

async function getProduct(storeUrl: string, productId: string) {
  const result = await getPublicStorefrontProduct(storeUrl, productId)
  return result.kind === "ok" ? result.payload : null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ storeUrl: string; productId: string }>
}): Promise<Metadata> {
  const { storeUrl, productId } = await params
  const data = await getProduct(storeUrl, productId)
  if (!data) return { title: "Product Not Found" }
  const tagNames: string[] = (data.product.tags ?? []).map((t: { name: string }) => t.name)
  return {
    title: data.product.title,
    description: (data.product.description ?? "").slice(0, 160) || undefined,
    keywords: tagNames.length > 0 ? tagNames.join(", ") : undefined,
  }
}

function renderDeliveryInfo(deliveryType: string) {
  if (deliveryType === "external_link") {
    return (
      <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center shrink-0">
              <ExternalLink className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">External Access</h3>
              <p className="text-sm text-muted-foreground">
                After purchase, you will be redirected to access this product externally.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
  if (deliveryType === "manual") {
    return (
      <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Manual Delivery</h3>
              <p className="text-sm text-muted-foreground">
                This is a manually delivered product. After purchase, you will receive contact details to connect with the seller.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
  // default: download
  return (
    <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
            <Download className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">Instant Download</h3>
            <p className="text-sm text-muted-foreground">
              Download immediately after purchase via email and dashboard.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ storeUrl: string; productId: string }>
}) {
  const { storeUrl, productId } = await params
  const data = await getProduct(storeUrl, productId)
  if (!data) notFound()

  const { product, storefront, seller } = data
  const originalPrice = product.originalPrice ? parseFloat(product.originalPrice) : null
  const price = parseFloat(product.price)
  const hasDiscount = originalPrice && originalPrice > price
  const discountPercent = hasDiscount && originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0

  // Build the image strip: hero is the cover image; gallery rows follow.
  // Falls back to gallery's first image if cover isn't set.
  const galleryImages: Array<{ id: string; imageUrl: string; altText?: string | null }> =
    Array.isArray(product.gallery) ? product.gallery : []
  const heroImage: string | null =
    product.coverImageUrl ?? galleryImages[0]?.imageUrl ?? null
  // Avoid duplicating the cover when it's also the first gallery entry.
  const stripImages = galleryImages.filter((g) => g.imageUrl !== heroImage)

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Button asChild variant="ghost" className="gap-2">
            <Link href={`/store/${storeUrl}`}>
              <ArrowLeft className="w-4 h-4" />
              Back to Store
            </Link>
          </Button>
          <h1 className="font-semibold truncate max-w-[200px]">
            {storefront?.storeName ?? seller?.name}
          </h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Share2 className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Heart className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left - Product Image + Gallery strip */}
          <div className="space-y-3">
            <div className="relative aspect-[4/3] bg-muted rounded-2xl overflow-hidden">
              {heroImage ? (
                <Image
                  src={heroImage}
                  alt={product.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-24 h-24 text-muted-foreground" />
                </div>
              )}
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                {product.subscriptionDuration && (
                  <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                    {product.subscriptionDuration} Subscription
                  </span>
                )}
                {product.deliveryType === "download" && (
                  <span className="bg-blue-500 text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                    <Download className="w-3 h-3" />
                    Instant Download
                  </span>
                )}
                {hasDiscount && (
                  <span className="bg-destructive text-destructive-foreground text-xs font-medium px-3 py-1 rounded-full">
                    Sale
                  </span>
                )}
              </div>
            </div>

            {stripImages.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {stripImages.slice(0, 8).map((g) => (
                  <div key={g.id} className="relative aspect-square bg-muted rounded-md overflow-hidden">
                    <Image
                      src={g.imageUrl}
                      alt={g.altText ?? product.title}
                      fill
                      sizes="(max-width: 1024px) 25vw, 12vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right - Product Info */}
          <div className="space-y-6">
            {/* Price Card */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold">{formatCurrency(product.price)}</span>
                    {hasDiscount && originalPrice && (
                      <span className="text-lg text-muted-foreground line-through">
                        {formatCurrency(originalPrice)}
                      </span>
                    )}
                  </div>
                  {hasDiscount && originalPrice && (
                    <span className="mt-1 inline-block text-sm font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded">
                      Save ₹{(originalPrice - price).toLocaleString("en-IN")} ({discountPercent}% OFF)
                    </span>
                  )}
                </div>
                {seller?.id ? (
                  <BuyButton productId={product.id} sellerId={seller.id} />
                ) : (
                  <Button asChild size="lg" className="w-full h-12 gap-2 gradient-primary text-white">
                    <Link href={`/checkout/${product.id}`}>
                      <ShoppingCart className="w-5 h-5" />
                      Buy Now
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Seller Info Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold shrink-0">
                      {(seller?.name ?? storefront?.storeName ?? "G").charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold">{seller?.name ?? storefront?.storeName}</p>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">4.8</span>
                      </div>
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/store/${seller?.storeUrl ?? storeUrl}`}>
                      View Store
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Product Details Below */}
        <div className="mt-12 space-y-6">
          {/* Title & Stats */}
          <div>
            <h1 className="text-3xl font-bold mb-3">{product.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="font-medium">4.8</span>
                <span>(78 reviews)</span>
              </div>
              <span>•</span>
              <span>234 sales</span>
            </div>
          </div>

          <Separator />

          {/* Description */}
          {product.description && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {product.description}
              </p>
            </div>
          )}

          {/* Delivery Info Card */}
          {renderDeliveryInfo(product.deliveryType)}
        </div>
      </div>
    </div>
  )
}
