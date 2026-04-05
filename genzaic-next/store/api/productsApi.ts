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
    }),
    createProduct: builder.mutation<Product, FormData>({
      query: (body) => ({ url: "/products", method: "POST", body }),
      invalidatesTags: [{ type: "Product", id: "LIST" }, "ProductStats"],
    }),
    updateProduct: builder.mutation<Product, { id: string; body: FormData }>({
      query: ({ id, body }) => ({ url: `/products/${id}`, method: "PUT", body }),
      invalidatesTags: (_, __, { id }) => [{ type: "Product", id }, { type: "Product", id: "LIST" }],
      async onQueryStarted({ id }, { dispatch, queryFulfilled, getState }) {
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
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          productsApi.util.updateQueryData("getProducts", {}, (draft) => {
            draft.products = draft.products.filter((p) => p.id !== id)
            draft.total = draft.total - 1
          })
        )
        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
        }
      },
    }),
    toggleProductStatus: builder.mutation<Product, string>({
      query: (id) => ({ url: `/products/${id}/toggle-status`, method: "PATCH" }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          productsApi.util.updateQueryData("getProducts", {}, (draft) => {
            const product = draft.products.find((p) => p.id === id)
            if (product) product.isActive = !product.isActive
          })
        )
        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
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
