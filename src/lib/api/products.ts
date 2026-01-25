/**
 * Products API
 * Frontend API integration for product operations
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';

// Helper function for JSON API calls
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

  if (!response.ok) {
    throw new Error(data.message || 'An error occurred');
  }

  return data;
}

// Types
export interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  originalPrice?: number;
  deliveryType: 'download' | 'external_link' | 'manual';
  externalUrl?: string;
  sellerContactEmail?: string;
  sellerContactPhone?: string;
  sellerContactWhatsapp?: string;
  subscriptionDuration?: string;
  fileUrl: string;
  thumbnailUrl?: string;
  seoTitle?: string;
  seoKeywords?: string;
  isActive: boolean;
  stock?: number | null;
  downloads: number;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  totalDownloads: number;
  totalViews: number;
}

export interface ProductQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: 'createdAt' | 'title' | 'price' | 'views' | 'downloads';
  sortOrder?: 'asc' | 'desc';
}

export interface ProductListResponse {
  success: boolean;
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CreateProductData {
  title: string;
  description?: string;
  price: number;
  originalPrice?: number;
  deliveryType: 'download' | 'external_link' | 'manual';
  externalUrl?: string;
  sellerContactEmail?: string;
  sellerContactPhone?: string;
  sellerContactWhatsapp?: string;
  subscriptionDuration?: string;
  seoTitle?: string;
  seoKeywords?: string;
  stock?: number | null;
  isActive?: boolean;
}

export interface UpdateProductData {
  title?: string;
  description?: string;
  price?: number;
  originalPrice?: number;
  deliveryType?: 'download' | 'external_link' | 'manual';
  externalUrl?: string;
  sellerContactEmail?: string;
  sellerContactPhone?: string;
  sellerContactWhatsapp?: string;
  subscriptionDuration?: string;
  seoTitle?: string;
  seoKeywords?: string;
  stock?: number | null;
  isActive?: boolean;
}

// API Methods
export const productsAPI = {
  /**
   * Get all products with pagination and filtering
   */
  getProducts: async (query?: ProductQuery): Promise<ProductListResponse> => {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.search) params.append('search', query.search);
    if (query?.isActive !== undefined) params.append('isActive', query.isActive.toString());
    if (query?.sortBy) params.append('sortBy', query.sortBy);
    if (query?.sortOrder) params.append('sortOrder', query.sortOrder);

    const queryString = params.toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;

    return apiFetch(endpoint, {
      method: 'GET',
    });
  },

  /**
   * Get product statistics
   */
  getProductStats: async () => {
    return apiFetch('/products/stats', {
      method: 'GET',
    });
  },

  /**
   * Get single product by ID
   */
  getProductById: async (id: string) => {
    return apiFetch(`/products/${id}`, {
      method: 'GET',
    });
  },

  /**
   * Create new product with files
   */
  createProduct: async (
    data: CreateProductData,
    files?: { productFile?: File; thumbnail?: File }
  ) => {
    const formData = new FormData();

    // Append product data
    formData.append('title', data.title);
    formData.append('price', data.price.toString());
    if (data.description) formData.append('description', data.description);
    if (data.seoTitle) formData.append('seoTitle', data.seoTitle);
    if (data.seoKeywords) formData.append('seoKeywords', data.seoKeywords);
    if (data.stock !== undefined) formData.append('stock', data.stock?.toString() || '');
    if (data.isActive !== undefined) formData.append('isActive', data.isActive.toString());

    // Append files
    if (files?.productFile) formData.append('productFile', files.productFile);
    if (files?.thumbnail) formData.append('thumbnail', files.thumbnail);

    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to create product');
    }

    return responseData;
  },

  /**
   * Update product with optional files
   */
  updateProduct: async (
    id: string,
    data: UpdateProductData,
    files?: { productFile?: File; thumbnail?: File }
  ) => {
    const formData = new FormData();

    // Append product data (only if provided)
    if (data.title) formData.append('title', data.title);
    if (data.price) formData.append('price', data.price.toString());
    if (data.description !== undefined) formData.append('description', data.description);
    if (data.seoTitle !== undefined) formData.append('seoTitle', data.seoTitle);
    if (data.seoKeywords !== undefined) formData.append('seoKeywords', data.seoKeywords);
    if (data.stock !== undefined) formData.append('stock', data.stock?.toString() || '');
    if (data.isActive !== undefined) formData.append('isActive', data.isActive.toString());

    // Append files
    if (files?.productFile) formData.append('productFile', files.productFile);
    if (files?.thumbnail) formData.append('thumbnail', files.thumbnail);

    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      body: formData,
      credentials: 'include',
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to update product');
    }

    return responseData;
  },

  /**
   * Delete product
   */
  deleteProduct: async (id: string) => {
    return apiFetch(`/products/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Toggle product status (active/inactive)
   */
  toggleProductStatus: async (id: string) => {
    return apiFetch(`/products/${id}/toggle-status`, {
      method: 'PATCH',
    });
  },
};

export default productsAPI;
