/**
 * Authentication API Client
 * Handles all API calls to the backend authentication endpoints
 */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api"

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
}

interface SignupData {
  name: string
  email: string
  password: string
  role?: "buyer" | "seller"
}

interface LoginData {
  email: string
  password: string
}

interface VerifyEmailData {
  email: string
  otp: string
}

interface ForgotPasswordData {
  email: string
}

interface ResetPasswordData {
  token: string
  newPassword: string
}

/**
 * Generic fetch wrapper with error handling
 */
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include", // IMPORTANT: Send cookies with requests
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "An error occurred")
    }

    return data
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message)
    }
    throw new Error("Network error occurred")
  }
}

/**
 * Authentication API endpoints
 */
export const authAPI = {
  /**
   * Register a new user
   */
  signup: async (data: SignupData): Promise<ApiResponse> => {
    return apiFetch("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  /**
   * Verify email with OTP
   */
  verifyEmail: async (data: VerifyEmailData): Promise<ApiResponse> => {
    return apiFetch("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  /**
   * Login with email and password
   */
  login: async (data: LoginData): Promise<ApiResponse> => {
    return apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  /**
   * Logout current user
   */
  logout: async (): Promise<ApiResponse> => {
    return apiFetch("/auth/logout", {
      method: "POST",
    })
  },

  /**
   * Get current authenticated user
   */
  getCurrentUser: async (): Promise<ApiResponse> => {
    return apiFetch("/auth/me", {
      method: "GET",
    })
  },

  /**
   * Refresh access token
   */
  refreshToken: async (): Promise<ApiResponse> => {
    return apiFetch("/auth/refresh", {
      method: "POST",
    })
  },

  /**
   * Request password reset
   */
  forgotPassword: async (data: ForgotPasswordData): Promise<ApiResponse> => {
    return apiFetch("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  /**
   * Reset password with token
   */
  resetPassword: async (data: ResetPasswordData): Promise<ApiResponse> => {
    return apiFetch("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  /**
   * Resend verification OTP
   */
  resendOTP: async (email: string): Promise<ApiResponse> => {
    return apiFetch("/auth/resend-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
    })
  },
}

export default authAPI
