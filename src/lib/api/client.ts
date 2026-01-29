/**
 * Centralized API Client
 * Handles common functionality like:
 * - Base URL configuration
 * - Default headers (Content-Type)
 * - Credentials (cookies)
 * - Error handling
 * - Automatic token refreshing on 401 Unauthorized
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api"

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
}

let isRefreshing = false
let failedQueue: Array<{
  resolve: (value: unknown) => void
  reject: (reason?: any) => void
}> = []

const processQueue = (error: any, token: any = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

/**
 * Generic fetch wrapper with interceptors
 */
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const defaultHeaders = {
    "Content-Type": "application/json",
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: "include" as RequestCredentials,
  }

  try {
    const response = await fetch(url, config)
    const data = await response.json()

    // Handle 401 Unauthorized - Auto Refresh Token
    if (response.status === 401) {
      // If this was already a refresh attempt, fail immediately
      if (endpoint === "/auth/refresh") {
        throw new Error(data.message || "Session expired")
      }

      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => {
            return apiFetch<T>(endpoint, options)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      isRefreshing = true

      try {
        // Attempt to refresh token
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        })

        if (!refreshResponse.ok) {
          throw new Error("Refresh failed")
        }

        processQueue(null)
        
        // Retry original request
        return apiFetch<T>(endpoint, options)
      } catch (refreshError) {
        processQueue(refreshError, null)
        // Trigger generic logout event
        window.dispatchEvent(new CustomEvent("auth:unauthorized"))
        throw new Error(data.message || "Session expired. Please login again.")
      } finally {
        isRefreshing = false
      }
    }

    if (!response.ok) {
      throw new Error(data.message || "An error occurred")
    }

    return data
  } catch (error) {
    if (error instanceof Error) {
      throw error // Re-throw generic errors to be handled by caller
    }
    throw new Error("Network error occurred")
  }
}
