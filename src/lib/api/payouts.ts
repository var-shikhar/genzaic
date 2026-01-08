/**
 * Payouts API Client
 * Frontend API client for payout operations
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api";

// Types
export interface Payout {
  id: string;
  userId: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  transactionId: string | null;
  utrNumber: string | null;
  failureReason: string | null;
  processedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BankAccount {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
}

export interface PayoutStats {
  totalEarnings: number;
  completedPayouts: number;
  pendingPayouts: number;
  kycStatus: 'not_submitted' | 'pending' | 'verified' | 'rejected';
  kycVerified: boolean;
  bankAccount: BankAccount | null;
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

export const payoutsAPI = {
  /**
   * Get payout statistics
   */
  getPayoutStats: async (): Promise<{ stats: PayoutStats; message: string }> => {
    return apiFetch("/payouts/stats", {
      method: "GET",
    });
  },

  /**
   * Get all payouts for user
   */
  getPayouts: async (filters?: {
    status?: 'pending' | 'processing' | 'completed' | 'failed';
    skip?: number;
    take?: number;
  }): Promise<{ payouts: Payout[]; total: number; message: string }> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.skip !== undefined) params.append('skip', filters.skip.toString());
    if (filters?.take !== undefined) params.append('take', filters.take.toString());

    const queryString = params.toString();
    return apiFetch(`/payouts${queryString ? `?${queryString}` : ''}`, {
      method: "GET",
    });
  },

  /**
   * Get single payout by ID
   */
  getPayoutById: async (payoutId: string): Promise<{ payout: Payout; message: string }> => {
    return apiFetch(`/payouts/${payoutId}`, {
      method: "GET",
    });
  },
};

export default payoutsAPI;
