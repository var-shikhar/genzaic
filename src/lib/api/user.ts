/**
 * User API Client
 * Frontend API client for user profile operations
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api";

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: 'buyer' | 'seller' | 'admin';
  isSeller: boolean;
  storeUrl: string | null;
  planType: 'creator' | 'startup' | 'enterprise';
  kycStatus: 'not_submitted' | 'pending' | 'verified' | 'rejected';
  onboardingComplete: boolean;
  emailVerified: boolean;
  followersCount: number;
  totalProducts: number;
  totalSales: number;
  totalRevenue: number;
  createdAt: string;
  updatedAt: string;
  storefront?: {
    id: string;
    storeName: string | null;
    platformFeeMode: 'seller' | 'buyer';
    isPublished: boolean;
  } | null;
}

export interface UpdateProfileData {
  name?: string;
  storeUrl?: string;
  avatarUrl?: string | null;
}

export interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
}

// API Functions
async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "API request failed");
  }

  return data;
}

export const userAPI = {
  /**
   * Get current user profile
   */
  getProfile: async (): Promise<{ user: User; message: string }> => {
    return apiFetch("/user/profile", {
      method: "GET",
    });
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: UpdateProfileData): Promise<{ user: User; message: string }> => {
    return apiFetch("/user/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * Update password
   */
  updatePassword: async (data: UpdatePasswordData): Promise<{ message: string }> => {
    return apiFetch("/user/password", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * Check store URL availability
   */
  checkStoreUrlAvailability: async (storeUrl: string): Promise<{ available: boolean; message: string }> => {
    return apiFetch(`/user/check-store-url/${storeUrl}`, {
      method: "GET",
    });
  },
};

export default userAPI;
