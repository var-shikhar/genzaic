import { apiFetch } from "./client"

// Types
export interface Storefront {
  id: string
  userId: string
  storeUrl: string
  storeName: string
  description: string | null
  tagline: string | null
  coverImageUrl: string | null
  profileImageUrl: string | null
  themeId: string | null
  primaryColor: string | null
  fontFamily: string | null
  isPublished: boolean
  paymentMethods: string[] | null
  upiId: string | null
  contactEmail: string | null
  contactPhone: string | null
  socialInstagram: string | null
  socialTwitter: string | null
  socialYoutube: string | null
  socialWebsite: string | null
  seoTitle: string | null
  seoDescription: string | null
  seoKeywords: string | null
  createdAt: string
  updatedAt: string
  theme?: any
  products?: any[]
}

export interface UpdateStorefrontData {
  storeName?: string
  description?: string | null
  tagline?: string | null
  themeId?: string | null
  primaryColor?: string | null
  fontFamily?: string | null
  isPublished?: boolean
  paymentMethods?: string[] | null
  upiId?: string | null
  contactEmail?: string | null
  contactPhone?: string | null
  socialInstagram?: string | null
  socialTwitter?: string | null
  socialYoutube?: string | null
  socialWebsite?: string | null
  seoTitle?: string | null
  seoDescription?: string | null
  seoKeywords?: string | null
}

export interface StorefrontQuery {
  includeProducts?: boolean
  productsLimit?: number
}

export interface StorefrontStats {
  totalProducts: number
  activeProducts: number
  totalViews: number
  totalDownloads: number
  totalRevenue: number
  isPublished: boolean
  slug: string
}

export const storefrontAPI = {
  /**
   * Get user's storefront
   */
  getStorefront: async (query?: StorefrontQuery): Promise<{ storefront: Storefront; message: string }> => {
    const params = new URLSearchParams()
    if (query?.includeProducts !== undefined) {
      params.append("includeProducts", query.includeProducts.toString())
    }
    if (query?.productsLimit) {
      params.append("productsLimit", query.productsLimit.toString())
    }

    const queryString = params.toString()
    return apiFetch<{ storefront: Storefront; message: string }>(`/storefront${queryString ? `?${queryString}` : ""}`, {
      method: "GET",
    })
  },

  /**
   * Get public storefront by slug
   */
  getPublicStorefront: async (slug: string): Promise<{ storefront: Storefront; message: string }> => {
    return apiFetch<{ storefront: Storefront; message: string }>(`/storefront/public/${slug}`, {
      method: "GET",
    })
  },

  /**
   * Update storefront
   */
  updateStorefront: async (
    data: UpdateStorefrontData,
    files?: {
      coverImage?: File
      profileImage?: File
    }
  ): Promise<{ storefront: Storefront; message: string }> => {
    const formData = new FormData()

    // Append text fields
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value))
        } else {
          formData.append(key, value.toString())
        }
      }
    })

    // Append files
    if (files?.coverImage) {
      formData.append("coverImage", files.coverImage)
    }
    if (files?.profileImage) {
      formData.append("profileImage", files.profileImage)
    }

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api"

    const response = await fetch(`${API_BASE_URL}/storefront`, {
      method: "PUT",
      body: formData,
      credentials: "include",
    })

    const result = await response.json()

    if (!response.ok) {
       if (response.status === 401) {
            window.dispatchEvent(new CustomEvent("auth:unauthorized"))
       }
      throw new Error(result.message || "Failed to update storefront")
    }

    return result
  },

  /**
   * Toggle publish status
   */
  togglePublishStatus: async (): Promise<{ storefront: Storefront; message: string }> => {
    return apiFetch<{ storefront: Storefront; message: string }>("/storefront/toggle-publish", {
      method: "PATCH",
    })
  },

  /**
   * Get storefront stats
   */
  getStorefrontStats: async (): Promise<{ stats: StorefrontStats; message: string }> => {
    return apiFetch<{ stats: StorefrontStats; message: string }>("/storefront/stats", {
      method: "GET",
    })
  },

  /**
   * Check slug availability
   */
  checkSlugAvailability: async (slug: string): Promise<{ available: boolean; message: string }> => {
    return apiFetch<{ available: boolean; message: string }>(`/storefront/check-slug/${slug}`, {
      method: "GET",
    })
  },
}

export default storefrontAPI
