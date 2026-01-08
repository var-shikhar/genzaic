/**
 * Checkout API Client
 * Frontend API client for checkout and order operations
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
export interface ProductForCheckout {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnailUrl?: string;
  fileUrl?: string;
  seller: {
    id: string;
    name: string;
    email: string;
    storeUrl: string;
  };
  platformFeeMode: "seller" | "buyer";
}

export interface CreateOrderData {
  productId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string;
  buyerGstin?: string;
  paymentMethod: string;
  paymentId: string;
  sellerId: string;
}

export interface Order {
  id: string;
  productId: string;
  productTitle: string;
  productThumbnail?: string;
  buyerEmail: string;
  buyerName: string;
  totalAmount: number;
  downloadLink?: string;
  createdAt: string;
}

export const checkoutAPI = {
  /**
   * Get product details for checkout
   */
  getProductForCheckout: async (productId: string): Promise<{ product: ProductForCheckout; message: string }> => {
    const response = await apiFetch(`/checkout/product/${productId}`, {
      method: "GET",
    });
    return { product: response.data, message: response.message };
  },

  /**
   * Create order after payment
   */
  createOrder: async (data: CreateOrderData): Promise<{ order: Order; message: string }> => {
    const response = await apiFetch("/checkout/create-order", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return { order: response.data, message: response.message };
  },

  /**
   * Record download
   */
  recordDownload: async (orderId: string): Promise<{ message: string }> => {
    const response = await apiFetch("/checkout/record-download", {
      method: "POST",
      body: JSON.stringify({ orderId }),
    });
    return { message: response.message };
  },

  /**
   * Get order for download page
   */
  getOrderForDownload: async (orderId: string): Promise<{ order: Order; message: string }> => {
    const response = await apiFetch(`/checkout/order/${orderId}`, {
      method: "GET",
    });
    return { order: response.data, message: response.message };
  },
};
