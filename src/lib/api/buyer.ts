/**
 * Buyer API Client
 * Frontend API client for buyer-related operations (My Purchases)
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api";

// API Helper Function
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

// Types
export interface BuyerOrder {
  id: string;
  productId: string;
  productTitle: string;
  productThumbnail?: string;
  productDescription?: string;
  totalAmount: number;
  status: string;
  deliveryType: "download" | "external_link" | "manual";
  deliveryStatus?: "pending" | "delivered";
  externalUrl?: string;
  downloadCount: number;
  maxDownloads: number;
  downloadLink?: string;
  purchasedAt: string;
  sellerName: string;
  sellerEmail: string;
  sellerStoreUrl: string;
  sellerWhatsapp?: string;
  sellerPhone?: string;
}

export const buyerAPI = {
  /**
   * Get all orders for logged-in buyer
   */
  getOrders: async (): Promise<{ orders: BuyerOrder[]; total: number; message: string }> => {
    const response = await apiFetch("/buyer/orders", {
      method: "GET",
    });
    return { orders: response.data, total: response.total, message: response.message };
  },

  /**
   * Get single order details
   */
  getOrder: async (orderId: string): Promise<{ order: BuyerOrder; message: string }> => {
    const response = await apiFetch(`/buyer/orders/${orderId}`, {
      method: "GET",
    });
    return { order: response.data, message: response.message };
  },

  /**
   * Link guest orders to user account
   * Called automatically after signup/login from frontend
   */
  linkOrders: async (): Promise<{ linkedCount: number; message: string }> => {
    const response = await apiFetch("/buyer/link-orders", {
      method: "POST",
    });
    return { linkedCount: response.data.linkedCount, message: response.message };
  },
};
