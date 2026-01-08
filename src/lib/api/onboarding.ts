const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api"

// Helper function for API calls
async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include", // Important for httpOnly cookies
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || "An error occurred")
  }

  return data
}

// Types
export interface CreateProductData {
  title: string
  description?: string
  price: number
  seoTitle?: string
  seoKeywords?: string
  // Files handled separately via FormData
}

export interface UpdateStorefrontData {
  storeName?: string
  storeDescription?: string
  tagline?: string
  themeId?:
    | "minimal"
    | "modern"
    | "creative"
    | "professional"
    | "elegant"
    | "nature"
    | "sunset"
    | "ocean"
    | "midnight"
    | "candy"
  primaryColor?: string
  fontFamily?:
    | "dm-sans"
    | "montserrat"
    | "nunito"
    | "open-sans"
    | "outfit"
    | "quicksand"
    | "raleway"
    | "source-sans"
    | "space-grotesk"
    | "lora"
  isPublished?: boolean
}

export interface UpdatePaymentInfoData {
  paymentMethod: "bank" | "upi"
  // Bank details (stored in KYC table)
  documentType?: "pan" | "aadhaar"
  panNumber?: string
  aadhaarNumber?: string
  accountHolderName?: string
  accountNumber?: string
  ifscCode?: string
  bankName?: string
  // UPI details (stored in storefront)
  upiId?: string
}

export interface SelectPlanData {
  planType: "creator" | "startup"
}

// API Methods
export const onboardingAPI = {
  /**
   * Step 1: Create first product with files
   */
  createFirstProduct: async (
    data: CreateProductData,
    files?: { productFile?: File; thumbnail?: File }
  ) => {
    const formData = new FormData()

    // Append product data
    formData.append("title", data.title)
    formData.append("price", data.price.toString())
    if (data.description) formData.append("description", data.description)
    if (data.seoTitle) formData.append("seoTitle", data.seoTitle)
    if (data.seoKeywords) formData.append("seoKeywords", data.seoKeywords)

    // Append files
    if (files?.productFile) formData.append("productFile", files.productFile)
    if (files?.thumbnail) formData.append("thumbnail", files.thumbnail)

    const response = await fetch(`${API_BASE_URL}/onboarding/product`, {
      method: "POST",
      body: formData,
      credentials: "include",
    })

    const responseData = await response.json()

    if (!response.ok) {
      throw new Error(responseData.message || "Failed to create product")
    }

    return responseData
  },

  /**
   * Step 2: Update storefront settings with images
   */
  updateStorefrontSettings: async (
    data: UpdateStorefrontData,
    files?: { coverImage?: File; profileImage?: File }
  ) => {
    const formData = new FormData()

    // Append storefront data
    if (data.storeName) formData.append("storeName", data.storeName)
    if (data.storeDescription)
      formData.append("storeDescription", data.storeDescription)
    if (data.tagline) formData.append("tagline", data.tagline)
    if (data.themeId) formData.append("themeId", data.themeId)
    if (data.primaryColor) formData.append("primaryColor", data.primaryColor)
    if (data.fontFamily) formData.append("fontFamily", data.fontFamily)
    if (data.isPublished !== undefined)
      formData.append("isPublished", data.isPublished.toString())

    // Append files
    if (files?.coverImage) formData.append("coverImage", files.coverImage)
    if (files?.profileImage) formData.append("profileImage", files.profileImage)

    const response = await fetch(`${API_BASE_URL}/onboarding/storefront`, {
      method: "PUT",
      body: formData,
      credentials: "include",
    })

    const responseData = await response.json()

    if (!response.ok) {
      throw new Error(responseData.message || "Failed to update storefront")
    }

    return responseData
  },

  /**
   * Step 3: Update payment information
   */
  updatePaymentInfo: async (data: UpdatePaymentInfoData) => {
    return apiFetch("/onboarding/payment", {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },

  /**
   * Step 4: Select plan
   */
  selectPlan: async (data: SelectPlanData) => {
    return apiFetch("/onboarding/plan", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  /**
   * Complete onboarding
   */
  completeOnboarding: async () => {
    return apiFetch("/onboarding/complete", {
      method: "POST",
    })
  },

  /**
   * Skip onboarding
   */
  skipOnboarding: async () => {
    return apiFetch("/onboarding/skip", {
      method: "POST",
    })
  },

  /**
   * Get onboarding status
   */
  getOnboardingStatus: async () => {
    return apiFetch("/onboarding/status", {
      method: "GET",
    })
  },
}
