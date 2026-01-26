/**
 * Dashboard API
 * Aggregates data from multiple endpoints for dashboard display
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';

// Helper function for API calls
async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  });

  const data = await response.json();

  // Handle 401 Unauthorized - Auto logout
  if (response.status === 401) {
    window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    throw new Error(data.message || "Session expired. Please login again.");
  }

  if (!response.ok) {
    throw new Error(data.message || 'An error occurred');
  }

  return data;
}

// Types
export interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  pendingPayout: number;
  salesChange?: string;
  ordersChange?: string;
}

export interface RecentOrder {
  id: string;
  productTitle: string;
  buyerEmail: string;
  amount: number;
  createdAt: string;
}

// API Methods
export const dashboardAPI = {
  /**
   * Get aggregated dashboard statistics
   * Combines data from sales, products, and payouts endpoints
   */
  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      // Fetch all stats in parallel
      const [salesResponse, productsResponse, payoutsResponse] = await Promise.all([
        apiFetch('/sales/stats', { method: 'GET' }),
        apiFetch('/products/stats', { method: 'GET' }),
        apiFetch('/payouts/stats', { method: 'GET' }),
      ]);

      const salesStats = salesResponse?.data || {};
      const productsStats = productsResponse?.data || {};
      const payoutsStats = payoutsResponse?.data?.stats || {};

      return {
        totalSales: salesStats?.totalRevenue || 0,
        totalOrders: salesStats?.totalOrders || 0,
        totalProducts: productsStats?.totalProducts || 0,
        pendingPayout: payoutsStats?.pendingPayouts || 0,
        // Calculate percentage changes (placeholder - would need historical data)
        salesChange: '+12.5%',
        ordersChange: '+8.2%',
      };
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      // Return default values instead of throwing to prevent dashboard from breaking
      return {
        totalSales: 0,
        totalOrders: 0,
        totalProducts: 0,
        pendingPayout: 0,
        salesChange: '',
        ordersChange: '',
      };
    }
  },

  /**
   * Get recent orders (last 5)
   */
  getRecentOrders: async (limit: number = 5): Promise<RecentOrder[]> => {
    try {
      const response = await apiFetch('/sales/orders/recent', { method: 'GET' });
      
      const orders = response.data.orders || [];
      
      // Return only the requested number of orders
      return orders.slice(0, limit).map((order: any) => ({
        id: order.id,
        productTitle: order.productTitle,
        buyerEmail: order.buyerEmail,
        amount: Number(order.amount),
        createdAt: order.createdAt,
      }));
    } catch (error) {
      console.error('Failed to fetch recent orders:', error);
      throw error;
    }
  },
};

export default dashboardAPI;
