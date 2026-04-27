import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export interface Product {
  id: string
  storefrontId: string
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

export const productsApi = createApi({
  reducerPath: "productsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  tagTypes: ["Product", "ProductStats"],
  endpoints: (builder) => ({
    getProducts: builder.query<ProductsResponse, { page?: number; limit?: number; search?: string; status?: string }>({
      query: ({ page = 1, limit = 10, search, status } = {}) => {
        const params = new URLSearchParams({ page: String(page), limit: String(limit) })
        if (search) params.set("search", search)
        if (status) params.set("status", status)
        return `/products?${params}`
      },
      providesTags: (result) =>
        result
          ? [...result.products.map(({ id }) => ({ type: "Product" as const, id })), { type: "Product", id: "LIST" }]
          : [{ type: "Product", id: "LIST" }],
    }),
    getProduct: builder.query<Product, string>({
      query: (id) => `/products/${id}`,
      providesTags: (_, __, id) => [{ type: "Product", id }],
    }),
    getProductStats: builder.query<ProductStats, void>({
      query: () => "/products/stats",
      providesTags: ["ProductStats"],
      // Stats are also server-side cached for 30s. Holding the client-side
      // copy for 5 minutes after unmount means rapid dashboard navigation
      // shows the cached numbers instantly without re-fetching.
      keepUnusedDataFor: 300,
    }),
    createProduct: builder.mutation<Product, FormData>({
      query: (body) => ({ url: "/products", method: "POST", body }),
      invalidatesTags: [{ type: "Product", id: "LIST" }, "ProductStats"],
      // Post-success patch: insert the created product into every active
      // getProducts cache so the dashboard list updates instantly without
      // waiting for the LIST refetch.
      async onQueryStarted(_arg, { dispatch, queryFulfilled, getState }) {
        try {
          const { data: created } = await queryFulfilled
          for (const { endpointName, originalArgs } of productsApi.util.selectInvalidatedBy(getState(), [
            { type: "Product", id: "LIST" },
          ])) {
            if (endpointName !== "getProducts") continue
            dispatch(
              productsApi.util.updateQueryData("getProducts", originalArgs as Parameters<typeof productsApi.endpoints.getProducts.initiate>[0], (draft) => {
                draft.products.unshift(created)
                draft.total += 1
              })
            )
          }
        } catch {
          // Mutation failed — invalidation will refetch a clean list.
        }
      },
    }),
    updateProduct: builder.mutation<Product, { id: string; body: FormData }>({
      query: ({ id, body }) => ({ url: `/products/${id}`, method: "PUT", body }),
      invalidatesTags: (_, __, { id }) => [{ type: "Product", id }, { type: "Product", id: "LIST" }],
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        try {
          const { data: updatedProduct } = await queryFulfilled
          dispatch(
            productsApi.util.updateQueryData("getProduct", id, () => updatedProduct)
          )
        } catch {}
      },
    }),
    deleteProduct: builder.mutation<void, string>({
      query: (id) => ({ url: `/products/${id}`, method: "DELETE" }),
      invalidatesTags: (_, __, id) => [{ type: "Product", id }, { type: "Product", id: "LIST" }, "ProductStats"],
      // Optimistic remove: filter the deleted product from every active list
      // cache (no matter what page/search/status args). Roll back on failure.
      async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
        const patches: { undo: () => void }[] = []
        for (const { endpointName, originalArgs } of productsApi.util.selectInvalidatedBy(getState(), [
          { type: "Product", id: "LIST" },
        ])) {
          if (endpointName !== "getProducts") continue
          patches.push(
            dispatch(
              productsApi.util.updateQueryData("getProducts", originalArgs as Parameters<typeof productsApi.endpoints.getProducts.initiate>[0], (draft) => {
                draft.products = draft.products.filter((p) => p.id !== id)
                draft.total = Math.max(0, draft.total - 1)
              })
            )
          )
        }
        try {
          await queryFulfilled
        } catch {
          patches.forEach((p) => p.undo())
        }
      },
    }),
    toggleProductStatus: builder.mutation<Product, string>({
      query: (id) => ({ url: `/products/${id}/toggle-status`, method: "PATCH" }),
      // Optimistic toggle: flip isActive on every active list cache. Reverts
      // on server failure so the Switch UI snaps back.
      async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
        const patches: { undo: () => void }[] = []
        for (const { endpointName, originalArgs } of productsApi.util.selectInvalidatedBy(getState(), [
          { type: "Product", id: "LIST" },
        ])) {
          if (endpointName !== "getProducts") continue
          patches.push(
            dispatch(
              productsApi.util.updateQueryData("getProducts", originalArgs as Parameters<typeof productsApi.endpoints.getProducts.initiate>[0], (draft) => {
                const product = draft.products.find((p) => p.id === id)
                if (product) product.isActive = !product.isActive
              })
            )
          )
        }
        try {
          await queryFulfilled
        } catch {
          patches.forEach((p) => p.undo())
        }
      },
      invalidatesTags: (_, __, id) => [{ type: "Product", id }],
    }),
  }),
})

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useGetProductStatsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useToggleProductStatusMutation,
} = productsApi
