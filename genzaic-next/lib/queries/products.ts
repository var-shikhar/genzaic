"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { deleteJSON, getJSON, patchJSON, postForm, putForm } from "@/lib/react-query/fetcher"

export interface Product {
  id: string
  storefrontId: string
  categoryId?: string | null
  title: string
  description?: string | null
  price: string
  originalPrice?: string | null
  fileUrl?: string | null
  fileId?: string | null
  thumbnailUrl?: string | null
  thumbnailFileId?: string | null
  deliveryType: "download" | "external_link" | "manual"
  externalUrl?: string | null
  sellerContactEmail?: string | null
  sellerContactPhone?: string | null
  sellerContactWhatsapp?: string | null
  subscriptionDuration?: string | null
  seoTitle?: string | null
  seoKeywords?: string | null
  isActive: boolean
  stock?: number | null
  downloads: number
  views: number
  createdAt: string
  updatedAt: string
  // Detail-only fields populated by GET /api/products/[id]:
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

export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (form: FormData) => postForm<Product>("/api/products", form),
    onSuccess: (created) => {
      const lists = qc.getQueriesData<ProductsResponse>({ queryKey: productKeys.lists() })
      for (const [key, value] of lists) {
        if (!value) continue
        qc.setQueryData<ProductsResponse>(key, {
          ...value,
          products: [created, ...value.products],
          total: value.total + 1,
        })
      }
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
      qc.setQueryData(productKeys.detail(id), updated)
      qc.invalidateQueries({ queryKey: productKeys.lists() })
      qc.invalidateQueries({ queryKey: productKeys.detail(id) })
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
      qc.invalidateQueries({ queryKey: productKeys.detail(id) })
    },
  })
}
