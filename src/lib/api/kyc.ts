/**
 * KYC API Client
 * Frontend API client for KYC verification operations
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api";

// Types
export interface KycData {
  id: string;
  documentType: 'pan' | 'aadhaar';
  panNumber: string | null;
  aadhaarNumber: string | null;
  documentFileUrl: string | null;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  verificationStatus: 'not_submitted' | 'pending' | 'verified' | 'rejected';
  pennyDropStatus: 'pending' | 'success' | 'failed';
  rejectionReason: string | null;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitKycData {
  documentType: 'pan' | 'aadhaar';
  panNumber?: string | null;
  aadhaarNumber?: string | null;
  documentFileUrl?: string | null;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
}

export interface UpdateKycStatusData {
  verificationStatus: 'pending' | 'verified' | 'rejected';
  pennyDropStatus?: 'pending' | 'success' | 'failed';
  rejectionReason?: string | null;
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

export const kycAPI = {
  /**
   * Get current user's KYC data
   */
  getKyc: async (): Promise<{ kyc: KycData | null; message: string }> => {
    return apiFetch("/kyc", {
      method: "GET",
    });
  },

  /**
   * Submit KYC information
   */
  submitKyc: async (data: SubmitKycData): Promise<{ kyc: KycData; message: string }> => {
    return apiFetch("/kyc", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete KYC data
   */
  deleteKyc: async (): Promise<{ message: string }> => {
    return apiFetch("/kyc", {
      method: "DELETE",
    });
  },

  /**
   * Get all KYC submissions (admin only)
   */
  getAllKyc: async (filters?: {
    verificationStatus?: 'pending' | 'verified' | 'rejected';
    skip?: number;
    take?: number;
  }): Promise<{ kycs: KycData[]; total: number; message: string }> => {
    const params = new URLSearchParams();
    if (filters?.verificationStatus) params.append('verificationStatus', filters.verificationStatus);
    if (filters?.skip !== undefined) params.append('skip', filters.skip.toString());
    if (filters?.take !== undefined) params.append('take', filters.take.toString());

    const queryString = params.toString();
    return apiFetch(`/kyc/all${queryString ? `?${queryString}` : ''}`, {
      method: "GET",
    });
  },

  /**
   * Update KYC status (admin only)
   */
  updateKycStatus: async (kycId: string, data: UpdateKycStatusData): Promise<{ kyc: KycData; message: string }> => {
    return apiFetch(`/kyc/${kycId}/status`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
};

export default kycAPI;
