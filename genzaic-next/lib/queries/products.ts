"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { deleteJSON, getJSON, patchJSON, postForm, putForm } from "@/lib/react-query/fetcher"
import {
  productKeys,
  type Product,
  type ProductsResponse,
  type ProductStats,
  type ProductsListFilters,
} from "./products-keys"

// Re-export so existing `from "@/lib/queries/products"` imports keep working.
// New server-side imports should pull from "@/lib/queries/products-keys"
// directly — see the file header there for why.
export { productKeys }
export type { Product, ProductsResponse, ProductStats, ProductsListFilters }

export function useProducts(filters: ProductsListFilters = {}) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => {
      const { page = 1, limit = 10, search, status } = filters
      const params = new URLSearchParams({ page: String(page), limit: String(limit) })
      if (search) params.set("search", search)
      if (status) params.set("status", status)
      return getJSON<ProductsResponse>(`/api/products?${params}`)
    },
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => getJSON<Product>(`/api/products/${id}`),
    enabled: Boolean(id),
  })
}

export function useProductStats() {
  return useQuery({
    queryKey: productKeys.stats(),
    queryFn: () => getJSON<ProductStats>("/api/products/stats"),
    gcTime: 300_000,
    staleTime: 30_000,
  })
}

/** Build a placeholder Product row from the create-form payload. Filled with
 *  conservative defaults so list renderers don't crash on null reads. The
 *  `id` is a sentinel we look up in onSuccess to swap in the real row. */
function buildOptimisticProduct(form: FormData, tempId: string): Product {
  const get = (k: string) => {
    const v = form.get(k)
    return typeof v === "string" && v.length > 0 ? v : null
  }
  const now = new Date()
  return {
    id: tempId,
    storefrontId: "",
    categoryId: get("categoryId"),
    title: get("title") ?? "Untitled",
    slug: null,
    hexCode: "····",
    description: get("description"),
    price: get("price") ?? "0",
    originalPrice: get("originalPrice"),
    coverImageUrl: null,
    coverImageFileId: null,
    fileUrl: null,
    fileId: null,
    deliveryType: (get("deliveryType") ?? "download") as Product["deliveryType"],
    externalUrl: get("externalUrl"),
    sellerContactEmail: get("sellerContactEmail"),
    sellerContactPhone: get("sellerContactPhone"),
    sellerContactWhatsapp: get("sellerContactWhatsapp"),
    subscriptionDuration: get("subscriptionDuration"),
    seoTitle: null,
    seoKeywords: null,
    isActive: get("isActive") === "true",
    stock: null,
    downloads: 0,
    views: 0,
    avgRating: "0",
    totalReviews: 0,
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
  } as Product
}

export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation<
    Product,
    unknown,
    FormData,
    { tempId: string; snapshots: Array<[unknown, ProductsResponse | undefined]>; statsSnapshot?: ProductStats }
  >({
    mutationFn: (form) => postForm<Product>("/api/products", form),
    onMutate: async (form) => {
      // Cancel in-flight list/stats refetches so they can't clobber our
      // optimistic write.
      await Promise.all([
        qc.cancelQueries({ queryKey: productKeys.lists() }),
        qc.cancelQueries({ queryKey: productKeys.stats() }),
      ])
      const tempId = `__optimistic_${
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2)
      }`
      const optimistic = buildOptimisticProduct(form, tempId)

      const lists = qc.getQueriesData<ProductsResponse>({ queryKey: productKeys.lists() })
      const snapshots: Array<[unknown, ProductsResponse | undefined]> = []
      for (const [key, value] of lists) {
        snapshots.push([key, value])
        if (!value) continue
        qc.setQueryData<ProductsResponse>(key, {
          ...value,
          products: [optimistic, ...value.products],
          total: value.total + 1,
        })
      }

      const statsSnapshot = qc.getQueryData<ProductStats>(productKeys.stats())
      if (statsSnapshot) {
        qc.setQueryData<ProductStats>(productKeys.stats(), {
          ...statsSnapshot,
          totalProducts: statsSnapshot.totalProducts + 1,
          activeProducts:
            statsSnapshot.activeProducts + (optimistic.isActive ? 1 : 0),
        })
      }

      return { tempId, snapshots, statsSnapshot }
    },
    onError: (_err, _form, ctx) => {
      ctx?.snapshots.forEach(([key, value]) =>
        qc.setQueryData(key as readonly unknown[], value),
      )
      if (ctx?.statsSnapshot) {
        qc.setQueryData<ProductStats>(productKeys.stats(), ctx.statsSnapshot)
      }
    },
    onSuccess: (created, _form, ctx) => {
      // Swap the placeholder row for the real one across every list cache.
      if (!ctx?.tempId) return
      const lists = qc.getQueriesData<ProductsResponse>({ queryKey: productKeys.lists() })
      for (const [key, value] of lists) {
        if (!value) continue
        qc.setQueryData<ProductsResponse>(key, {
          ...value,
          products: value.products.map((p) => (p.id === ctx.tempId ? created : p)),
        })
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: productKeys.lists() })
      qc.invalidateQueries({ queryKey: productKeys.stats() })
    },
  })
}

export function useUpdateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: { id: string; body: FormData }) => putForm<Product>(`/api/products/${input.id}`, input.body),
    onSuccess: (updated, { id }) => {
      // Seed both possible cache keys (id-keyed and slug-keyed) with the
      // full updated product so the next visit shows fresh gallery/tags
      // immediately, no flicker. Then invalidate to confirm.
      qc.setQueryData(productKeys.detail(id), updated)
      if (updated?.slug) {
        qc.setQueryData(productKeys.detail(updated.slug), updated)
      }
      qc.invalidateQueries({ queryKey: productKeys.lists() })
      qc.invalidateQueries({ queryKey: productKeys.detail(id) })
      if (updated?.slug && updated.slug !== id) {
        qc.invalidateQueries({ queryKey: productKeys.detail(updated.slug) })
      }
      qc.invalidateQueries({ queryKey: productKeys.stats() })
    },
  })
}

export function useDeleteProduct() {
  const qc = useQueryClient()
  return useMutation<void, unknown, string, { snapshots: Array<[unknown, ProductsResponse | undefined]> }>({
    mutationFn: (id: string) => deleteJSON(`/api/products/${id}`),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: productKeys.lists() })
      const lists = qc.getQueriesData<ProductsResponse>({ queryKey: productKeys.lists() })
      const snapshots: Array<[unknown, ProductsResponse | undefined]> = []
      for (const [key, value] of lists) {
        snapshots.push([key, value])
        if (!value) continue
        qc.setQueryData<ProductsResponse>(key, {
          ...value,
          products: value.products.filter((p) => p.id !== id),
          total: Math.max(0, value.total - 1),
        })
      }
      return { snapshots }
    },
    onError: (_err, _id, ctx) => {
      ctx?.snapshots.forEach(([key, value]) => qc.setQueryData(key as readonly unknown[], value))
    },
    onSettled: (_data, _err, id) => {
      qc.invalidateQueries({ queryKey: productKeys.lists() })
      qc.invalidateQueries({ queryKey: productKeys.detail(id) })
      qc.invalidateQueries({ queryKey: productKeys.stats() })
    },
  })
}

export function useToggleProductStatus() {
  const qc = useQueryClient()
  return useMutation<Product, unknown, string, { snapshots: Array<[unknown, ProductsResponse | undefined]> }>({
    mutationFn: (id: string) => patchJSON<Product>(`/api/products/${id}/toggle-status`),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: productKeys.lists() })
      const lists = qc.getQueriesData<ProductsResponse>({ queryKey: productKeys.lists() })
      const snapshots: Array<[unknown, ProductsResponse | undefined]> = []
      for (const [key, value] of lists) {
        snapshots.push([key, value])
        if (!value) continue
        qc.setQueryData<ProductsResponse>(key, {
          ...value,
          products: value.products.map((p) =>
            p.id === id ? { ...p, isActive: !p.isActive } : p,
          ),
        })
      }
      return { snapshots }
    },
    onError: (_err, _id, ctx) => {
      ctx?.snapshots.forEach(([key, value]) => qc.setQueryData(key as readonly unknown[], value))
    },
    onSettled: (_data, _err, id) => {
      // Toggling active status changes which products appear on the dashboard
      // and which count toward `activeProducts` in stats. Invalidate both
      // alongside the detail key.
      qc.invalidateQueries({ queryKey: productKeys.detail(id) })
      qc.invalidateQueries({ queryKey: productKeys.lists() })
      qc.invalidateQueries({ queryKey: productKeys.stats() })
    },
  })
}
