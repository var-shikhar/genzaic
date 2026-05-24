import "server-only"
import { cache as reactCache } from "react"
import { db, storefronts, products, users, productImages, productTags, tags } from "@/lib/db"
import { eq, and, asc, desc } from "drizzle-orm"
import { cache, cacheKeys, cacheTTL } from "@/lib/cache"

// Hard cap on how many products are returned in the public payload. Sellers
// with hundreds of products would otherwise blow up the response.
export const PUBLIC_PRODUCT_LIMIT = 60

/**
 * Retry a function once on failure. We're behind Neon's serverless HTTP
 * driver and ImageKit/CDN edges — both have brief blips where a single
 * retry recovers cleanly. One retry only: more would just stack latency
 * on top of a real outage.
 */
async function retryOnce<T>(label: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (err) {
    console.warn(`[${label}] first attempt failed, retrying once:`, err)
    return await fn()
  }
}

/**
 * Loads a public storefront by URL slug. Used by both the API route at
 * `/api/storefront/public/[slug]` AND the server-rendered page at
 * `/store/[storeUrl]`. Sharing the loader ensures the in-memory cache hits
 * across both call sites — a single warm Node instance handling both
 * SSR HTML rendering and client-side RTK Query refetches will only execute
 * the underlying queries once per cache window per slug.
 *
 * Cached for 2 minutes (`cacheTTL.medium`). Public storefronts change rarely
 * enough that staleness is acceptable; the dashboard's edit flow can be
 * extended later to call `cache.invalidateByPrefix("public-storefront:")` on
 * publish.
 */
// React's `cache()` dedupes within a single SSR pass — so generateMetadata
// and the page render share one DB hit even if the underlying in-memory
// cache misses (cold node, post-eviction, etc.).
export const getPublicStorefront = reactCache(_getPublicStorefront)
async function _getPublicStorefront(slug: string) {
  return cache.getOrSet(
    cacheKeys.publicStorefront(slug),
    () =>
      retryOnce("public-storefront", async () => {
        // Explicit column list: never expose internal fields like upiId,
        // platformFeeMode, profileImageFileId, coverImageFileId, or
        // imprintSlug to anonymous visitors. Also omits SEO-only fields
        // that the listing view never reads.
        const [storefront] = await db
          .select({
            id: storefronts.id,
            userId: storefronts.userId,
            storeUrl: storefronts.storeUrl,
            storeName: storefronts.storeName,
            description: storefronts.description,
            profileImageUrl: storefronts.profileImageUrl,
            coverImageUrl: storefronts.coverImageUrl,
            tagline: storefronts.tagline,
            bio: storefronts.bio,
            themeId: storefronts.themeId,
            primaryColor: storefronts.primaryColor,
            fontFamily: storefronts.fontFamily,
            isPublished: storefronts.isPublished,
            contactEmail: storefronts.contactEmail,
            contactPhone: storefronts.contactPhone,
            contactWhatsapp: storefronts.contactWhatsapp,
            socialInstagram: storefronts.socialInstagram,
            socialTwitter: storefronts.socialTwitter,
            socialYoutube: storefronts.socialYoutube,
            socialWebsite: storefronts.socialWebsite,
            seoTitle: storefronts.seoTitle,
            seoDescription: storefronts.seoDescription,
            seoKeywords: storefronts.seoKeywords,
            imprintName: storefronts.imprintName,
            imprintTagline: storefronts.imprintTagline,
            imprintEditorsNote: storefronts.imprintEditorsNote,
            imprintCoverPreset: storefronts.imprintCoverPreset,
            imprintTypePairing: storefronts.imprintTypePairing,
            imprintAccent: storefronts.imprintAccent,
            showcase: storefronts.showcase,
          })
          .from(storefronts)
          .where(eq(storefronts.storeUrl, slug))
          .limit(1)

        if (!storefront) {
          return { kind: "not_found" as const }
        }

        if (!storefront.isPublished) {
          return { kind: "unpublished" as const }
        }

        const [sellerRows, activeProducts] = await Promise.all([
          db
            .select({
              id: users.id,
              name: users.name,
              avatarUrl: users.avatarUrl,
              followersCount: users.followersCount,
              totalSales: users.totalSales,
            })
            .from(users)
            .where(eq(users.id, storefront.userId))
            .limit(1),
          // Card-view fields only: never expose fileUrl / fileId (private
          // download asset) or sellerContact* (seller's delivery channels)
          // on the listing endpoint.
          db
            .select({
              id: products.id,
              storefrontId: products.storefrontId,
              categoryId: products.categoryId,
              slug: products.slug,
              hexCode: products.hexCode,
              title: products.title,
              description: products.description,
              price: products.price,
              originalPrice: products.originalPrice,
              coverImageUrl: products.coverImageUrl,
              deliveryType: products.deliveryType,
              subscriptionDuration: products.subscriptionDuration,
              isActive: products.isActive,
              stock: products.stock,
              downloads: products.downloads,
              views: products.views,
              avgRating: products.avgRating,
              totalReviews: products.totalReviews,
              createdAt: products.createdAt,
            })
            .from(products)
            .where(and(eq(products.storefrontId, storefront.id), eq(products.isActive, true)))
            .orderBy(desc(products.createdAt))
            .limit(PUBLIC_PRODUCT_LIMIT),
        ])

        return {
          kind: "ok" as const,
          payload: {
            ...storefront,
            seller: sellerRows[0] ?? null,
            products: activeProducts,
          },
        }
      }),
    { ttl: cacheTTL.medium, tags: ["public-storefront", `slug:${slug}`] },
  )
}

/**
 * Convenience helper for the SSR page which only cares about the success case.
 * Returns null for not_found / unpublished so the page can call `notFound()`.
 */
export async function getPublicStorefrontPayload(slug: string) {
  const result = await getPublicStorefront(slug)
  return result.kind === "ok" ? result.payload : null
}

export type PublicStorefrontPayload = NonNullable<
  Awaited<ReturnType<typeof getPublicStorefrontPayload>>
>

/**
 * Loads a single published product on a public storefront. Shared by the SSR
 * page at `/store/[storeUrl]/product/[productId]` and the API route at
 * `/api/storefront/public/[slug]/products/[productId]` so the in-memory cache
 * hits across both call sites.
 */
export const getPublicStorefrontProduct = reactCache(_getPublicStorefrontProduct)
async function _getPublicStorefrontProduct(slug: string, productId: string) {
  return cache.getOrSet(
    cacheKeys.publicStorefrontProduct(slug, productId),
    () =>
      retryOnce("public-storefront-product", async () => {
        const [storefront] = await db
          .select()
          .from(storefronts)
          .where(eq(storefronts.storeUrl, slug))
          .limit(1)

        if (!storefront) return { kind: "not_found" as const }
        if (!storefront.isPublished) return { kind: "not_found" as const }

        const [productRows, sellerRows] = await Promise.all([
          db
            .select()
            .from(products)
            .where(
              and(
                eq(products.id, productId),
                eq(products.storefrontId, storefront.id),
                eq(products.isActive, true),
              ),
            )
            .limit(1),
          db
            .select({
              id: users.id,
              name: users.name,
              avatarUrl: users.avatarUrl,
              storeUrl: storefronts.storeUrl,
              totalSales: users.totalSales,
            })
            .from(users)
            .leftJoin(storefronts, eq(storefronts.userId, users.id))
            .where(eq(users.id, storefront.userId))
            .limit(1),
        ])

        const product = productRows[0]
        if (!product) return { kind: "product_not_found" as const }

        const [galleryRows, tagRows] = await Promise.all([
          db
            .select({
              id: productImages.id,
              imageUrl: productImages.imageUrl,
              altText: productImages.altText,
            })
            .from(productImages)
            .where(eq(productImages.productId, product.id))
            .orderBy(asc(productImages.sortOrder)),
          db
            .select({ id: tags.id, name: tags.name })
            .from(productTags)
            .innerJoin(tags, eq(tags.id, productTags.tagId))
            .where(eq(productTags.productId, product.id)),
        ])

        return {
          kind: "ok" as const,
          payload: {
            product: { ...product, gallery: galleryRows, tags: tagRows },
            storefront: {
              storeName: storefront.storeName,
              storeUrl: storefront.storeUrl,
              themeId: storefront.themeId,
              primaryColor: storefront.primaryColor,
            },
            seller: sellerRows[0] ?? null,
          },
        }
      }),
    { ttl: cacheTTL.medium, tags: ["public-storefront", `slug:${slug}`] },
  )
}

/**
 * Invalidate every cached read that could possibly reference this seller's
 * public storefront — the storefront envelope itself AND every single
 * product detail entry underneath it. Called from every mutation endpoint
 * that changes the published payload (storefront edits, publish toggle,
 * product create/update/delete/toggle-status).
 *
 * We accept the userId (not the slug) because all the mutation routes start
 * from the session and haven't loaded the storefront row yet. A single
 * indexed lookup finds the slug; if the storefront doesn't exist or the slug
 * is null, we no-op.
 */
export async function invalidatePublicStorefrontForUser(userId: string): Promise<void> {
  const [row] = await db
    .select({ storeUrl: storefronts.storeUrl })
    .from(storefronts)
    .where(eq(storefronts.userId, userId))
    .limit(1)

  const slug = row?.storeUrl
  if (!slug) return

  cache.delete(cacheKeys.publicStorefront(slug))
  cache.invalidateByPrefix(`public-storefront-product:${slug}:`)
}

/**
 * Variant for callers that already have the slug in hand.
 */
export function invalidatePublicStorefrontBySlug(slug: string): void {
  cache.delete(cacheKeys.publicStorefront(slug))
  cache.invalidateByPrefix(`public-storefront-product:${slug}:`)
}
