// Shared query keys + types for products. Lives outside the "use client"
// boundary so server components (e.g. dashboard prefetches) can import the
// key factories directly. In Next.js 15 every export from a "use client"
// module becomes a client reference when imported on the server, which
// turns plain functions like `productKeys.stats()` into uncallable stubs.

import type { Product as DbProduct } from "@/lib/db/schema"

/** Client-side product: the DB row plus optional detail-view extras
 *  (gallery + tags) populated by `GET /api/products/[id]`. Timestamps
 *  arrive as JSON strings on the wire — the Drizzle inferred type names
 *  them `Date`, but consumers always wrap with `new Date(...)`. */
export type Product = DbProduct & {
  gallery?: { id: string; imageUrl: string }[]
  tags?: { id: string; name: string }[]
}

export interface ProductsResponse {
  products: Product[]
  total: number
  page: number
  limit: number
}

export interface ProductStats {
  totalProducts: number
  activeProducts: number
  totalDownloads: number
  totalViews: number
}

export interface ProductsListFilters {
  page?: number
  limit?: number
  search?: string
  status?: string
}

export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters: ProductsListFilters) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  stats: () => [...productKeys.all, "stats"] as const,
} as const
