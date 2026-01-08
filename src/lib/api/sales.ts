/**
 * Sales API Client
 * Frontend API client for sales and orders operations
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

// Types matching backend Order and DownloadLog models
export type OrderStatus = "pending" | "completed" | "refunded";
export type DeliveryType = "download" | "external_link" | "manual";
export type DeliveryStatus = "pending" | "delivered";

export interface Order {
  id: string;
  sellerId: string;
  productId: string;
  productTitle: string;
  productThumbnail?: string;
  productDescription?: string;
  buyerEmail: string;
  buyerName: string;
  buyerPhone?: string;
  buyerGstin?: string;
  amount: number;
  gstAmount: number;
  platformFee?: number;
  totalAmount: number;
  status: OrderStatus;
  deliveryType: DeliveryType;
  deliveryStatus?: DeliveryStatus;
  externalUrl?: string;
  paymentMethod?: string;
  paymentId?: string;
  downloadCount: number;
  maxDownloads: number;
  downloadLink?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DownloadLog {
  id: string;
  orderId: string;
  productTitle: string;
  buyerName: string;
  buyerEmail: string;
  ipAddress?: string;
  userAgent?: string;
  downloadedAt: string;
}

export interface SalesStats {
  totalRevenue: number;
  totalOrders: number;
  completedOrders: number;
  pendingAmount: number;
  monthlyRevenue: number;
}

export const salesAPI = {
  /**
   * Get sales statistics
   */
  getSalesStats: async (): Promise<{ stats: SalesStats; message: string }> => {
    const response = await apiFetch("/sales/stats", { method: "GET" });
    return { stats: response.data, message: response.message };
  },

  /**
   * Get all orders with optional filters
   */
  getOrders: async (filters?: {
    status?: OrderStatus;
    search?: string;
    sortBy?: "newest" | "oldest" | "amount-high" | "amount-low";
    skip?: number;
    take?: number;
  }): Promise<{ orders: Order[]; total: number; message: string }> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.search) params.append("search", filters.search);
    if (filters?.sortBy) params.append("sortBy", filters.sortBy);
    if (filters?.skip !== undefined) params.append("skip", filters.skip.toString());
    if (filters?.take !== undefined) params.append("take", filters.take.toString());

    const queryString = params.toString();
    const response = await apiFetch(`/sales/orders${queryString ? `?${queryString}` : ""}`, {
      method: "GET",
    });
    return { orders: response.data.orders, total: response.data.total, message: response.message };
  },

  /**
   * Get recent orders (last 7 days)
   */
  getRecentOrders: async (): Promise<{ orders: Order[]; message: string }> => {
    const response = await apiFetch("/sales/orders/recent", { method: "GET" });
    return { orders: response.data.orders, message: response.message };
  },

  /**
   * Get download logs
   */
  getDownloadLogs: async (filters?: {
    skip?: number;
    take?: number;
  }): Promise<{ downloadLogs: DownloadLog[]; total: number; message: string }> => {
    const params = new URLSearchParams();
    if (filters?.skip !== undefined) params.append("skip", filters.skip.toString());
    if (filters?.take !== undefined) params.append("take", filters.take.toString());

    const queryString = params.toString();
    const response = await apiFetch(`/sales/downloads${queryString ? `?${queryString}` : ""}`, {
      method: "GET",
    });
    return { downloadLogs: response.data.downloadLogs, total: response.data.total, message: response.message };
  },

  /**
   * Get a single order by ID
   */
  getOrderById: async (orderId: string): Promise<{ order: Order; message: string }> => {
    const response = await apiFetch(`/sales/orders/${orderId}`, { method: "GET" });
    return { order: response.data, message: response.message };
  },
};
