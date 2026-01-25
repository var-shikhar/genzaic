/**
 * AI API Service
 * Handles AI-powered product extraction from text
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';

export interface ExtractedProduct {
  title: string;
  description: string;
  price?: number;
  originalPrice?: number;
  subscriptionDuration?: string;
}

export interface ParseProductTextResponse {
  success: boolean;
  products: ExtractedProduct[];
  count: number;
}

/**
 * Parse product text using AI
 */
export const parseProductText = async (text: string): Promise<ParseProductTextResponse> => {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_BASE_URL}/ai/parse-product-text`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to parse product text');
  }

  return response.json();
};
