/**
 * Products API
 * Frontend API integration for product operations
 */

import { apiFetch } from "./client"

// Types
export interface Product {
  id: string
  title: string
  description?: string
  price: number
  originalPrice?: number
  deliveryType: 'download' | 'external_link' | 'manual'
  externalUrl?: string
  sellerContactEmail?: string
  sellerContactPhone?: string
  sellerContactWhatsapp?: string
  subscriptionDuration?: string
  fileUrl: string
  thumbnailUrl?: string
  seoTitle?: string
  seoKeywords?: string
  isActive: boolean
  stock?: number | null
  downloads: number
  views: number
  createdAt: string
  updatedAt: string
}

export interface ProductStats {
  totalProducts: number
  activeProducts: number
  inactiveProducts: number
  totalDownloads: number
  totalViews: number
}

export interface ProductQuery {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
  sortBy?: 'createdAt' | 'title' | 'price' | 'views' | 'downloads'
  sortOrder?: 'asc' | 'desc'
}

export interface ProductListResponse {
  success: boolean
  data: Product[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface CreateProductData {
  title: string
  description?: string
  price: number
  originalPrice?: number
  deliveryType: 'download' | 'external_link' | 'manual'
  externalUrl?: string
  sellerContactEmail?: string
  sellerContactPhone?: string
  sellerContactWhatsapp?: string
  subscriptionDuration?: string
  seoTitle?: string
  seoKeywords?: string
  stock?: number | null
  isActive?: boolean
}

export interface UpdateProductData {
  title?: string
  description?: string
  price?: number
  originalPrice?: number
  deliveryType?: 'download' | 'external_link' | 'manual'
  externalUrl?: string
  sellerContactEmail?: string
  sellerContactPhone?: string
  sellerContactWhatsapp?: string
  subscriptionDuration?: string
  seoTitle?: string
  seoKeywords?: string
  stock?: number | null
  isActive?: boolean
}

// API Methods
export const productsAPI = {
  /**
   * Get all products with pagination and filtering
   */
  getProducts: async (query?: ProductQuery): Promise<ProductListResponse> => {
    const params = new URLSearchParams()
    if (query?.page) params.append('page', query.page.toString())
    if (query?.limit) params.append('limit', query.limit.toString())
    if (query?.search) params.append('search', query.search)
    if (query?.isActive !== undefined) params.append('isActive', query.isActive.toString())
    if (query?.sortBy) params.append('sortBy', query.sortBy)
    if (query?.sortOrder) params.append('sortOrder', query.sortOrder)

    const queryString = params.toString()
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`

    return apiFetch<ProductListResponse>(endpoint, {
      method: 'GET',
    })
  },

  /**
   * Get product statistics
   */
  getProductStats: async () => {
    return apiFetch<ProductStats>('/products/stats', {
      method: 'GET',
    })
  },

  /**
   * Get single product by ID
   */
  getProductById: async (id: string) => {
    return apiFetch<{ success: boolean; data: Product }>(`/products/${id}`, {
      method: 'GET',
    })
  },

  /**
   * Create new product with files
   */
  createProduct: async (
    data: CreateProductData,
    files?: { productFile?: File; thumbnail?: File }
  ) => {
    const formData = new FormData()

    // Append product data
    formData.append('title', data.title)
    formData.append('price', data.price.toString())
    if (data.description) formData.append('description', data.description)
    if (data.seoTitle) formData.append('seoTitle', data.seoTitle)
    if (data.seoKeywords) formData.append('seoKeywords', data.seoKeywords)
    if (data.stock !== undefined) formData.append('stock', data.stock?.toString() || '')
    if (data.isActive !== undefined) formData.append('isActive', data.isActive.toString())
    
    // New fields
    if (data.originalPrice) formData.append('originalPrice', data.originalPrice.toString())
    formData.append('deliveryType', data.deliveryType)
    if (data.externalUrl) formData.append('externalUrl', data.externalUrl)
    if (data.sellerContactEmail) formData.append('sellerContactEmail', data.sellerContactEmail)
    if (data.sellerContactPhone) formData.append('sellerContactPhone', data.sellerContactPhone)
    if (data.sellerContactWhatsapp) formData.append('sellerContactWhatsapp', data.sellerContactWhatsapp)
    if (data.subscriptionDuration) formData.append('subscriptionDuration', data.subscriptionDuration)

    // Append files
    if (files?.productFile) formData.append('productFile', files.productFile)
    if (files?.thumbnail) formData.append('thumbnail', files.thumbnail)

    // Use apiFetch for FormData. Assuming apiFetch handles Content-Type correctly for FormData.
    return apiFetch('/products', {
      method: 'POST',
      body: formData,
      // Do not set 'Content-Type' header explicitly for FormData, let the browser handle it.
      // apiFetch should be designed to not override this if body is FormData.
      headers: {}, 
    })
  },

  /**
   * Update product with optional files
   */
  updateProduct: async (
    id: string,
    data: UpdateProductData,
    files?: { productFile?: File; thumbnail?: File }
  ) => {
    const formData = new FormData()

    // Append product data (only if provided)
    if (data.title) formData.append('title', data.title)
    if (data.price) formData.append('price', data.price.toString())
    if (data.description !== undefined) formData.append('description', data.description)
    if (data.seoTitle !== undefined) formData.append('seoTitle', data.seoTitle)
    if (data.seoKeywords !== undefined) formData.append('seoKeywords', data.seoKeywords)
    if (data.stock !== undefined) formData.append('stock', data.stock?.toString() || '')
    if (data.isActive !== undefined) formData.append('isActive', data.isActive.toString())

    // New fields
    if (data.originalPrice !== undefined) formData.append('originalPrice', data.originalPrice?.toString() || '')
    if (data.deliveryType) formData.append('deliveryType', data.deliveryType)
    if (data.externalUrl !== undefined) formData.append('externalUrl', data.externalUrl)
    if (data.sellerContactEmail !== undefined) formData.append('sellerContactEmail', data.sellerContactEmail)
    if (data.sellerContactPhone !== undefined) formData.append('sellerContactPhone', data.sellerContactPhone)
    if (data.sellerContactWhatsapp !== undefined) formData.append('sellerContactWhatsapp', data.sellerContactWhatsapp)
    if (data.subscriptionDuration !== undefined) formData.append('subscriptionDuration', data.subscriptionDuration)

    // Append files
    if (files?.productFile) formData.append('productFile', files.productFile)
    if (files?.thumbnail) formData.append('thumbnail', files.thumbnail)

    // Use apiFetch for FormData. Assuming apiFetch handles Content-Type correctly for FormData.
    return apiFetch(`/products/${id}`, {
      method: 'PUT',
      body: formData,
      // Do not set 'Content-Type' header explicitly for FormData, let the browser handle it.
      // apiFetch should be designed to not override this if body is FormData.
      headers: {},
    })
  },

  /**
   * Delete product
   */
  deleteProduct: async (id: string) => {
    return apiFetch(`/products/${id}`, {
      method: 'DELETE',
    })
  },

  /**
   * Toggle product status (active/inactive)
   */
  toggleProductStatus: async (id: string) => {
    return apiFetch(`/products/${id}/toggle-status`, {
      method: 'PATCH',
    })
  },
}

export default productsAPI
