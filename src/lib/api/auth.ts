import { apiFetch } from "./client"

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
 * Authentication API endpoints
 */
export const authAPI = {
  /**
   * Register a new user
   */
  signup: async (data: SignupData): Promise<ApiResponse> => {
    return apiFetch<ApiResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  /**
   * Verify email with OTP
   */
  verifyEmail: async (data: VerifyEmailData): Promise<ApiResponse> => {
    return apiFetch<ApiResponse>("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  /**
   * Login with email and password
   */
  login: async (data: LoginData): Promise<ApiResponse> => {
    return apiFetch<ApiResponse>("/auth/login", {
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
   * Note: This is usually called automatically by the client interceptor,
   * but exposed here if manual refresh is needed.
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
