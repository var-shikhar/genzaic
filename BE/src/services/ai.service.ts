/**
 * AI Service
 * Handles AI-powered product extraction from text using Google Gemini
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '@/config/environment';
import { logger } from '@/utils/logger';

interface ExtractedProduct {
  title: string;
  description: string;
  price?: number;
  originalPrice?: number;
  subscriptionDuration?: string;
}

export class AIService {
  private static genAI: GoogleGenerativeAI;

  /**
   * Initialize Google Generative AI
   */
  private static getAI() {
    if (!this.genAI) {
      this.genAI = new GoogleGenerativeAI(env.GOOGLE_AI_API_KEY);
    }
    return this.genAI;
  }

  /**
   * Extract product details from WhatsApp/text using Google Gemini
   */
  static async extractProducts(text: string): Promise<ExtractedProduct[]> {
    try {
      const genAI = this.getAI();
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-pro',
        generationConfig: {
          temperature: 0.1, // Low temperature for more consistent extraction
        },
      });

      const systemPrompt = `You are a product information extractor. Extract ALL product details from text that sellers typically share on WhatsApp to sell digital products/subscriptions.

Extract the following information for EACH product found:
- title: Product name/title
- description: Full description including features as bullet points (use • for bullets). Combine features into the description text.
- price: The seller's price in numbers only (no currency symbols)
- originalPrice: Official/original price if mentioned (for comparison)
- subscriptionDuration: Duration like "1 month", "3 months", "6 months", "1 year", "lifetime" if applicable

Common formats you might see:
1. "Product Name - Feature 1, Feature 2 - Rs 499"
2. "1. Product A (3 months) - Rs 299"
3. "Netflix Premium - 1 Year - Original: Rs 6000 - My Price: Rs 599"
4. Product lists with numbered items
5. Multiple products separated by new lines or numbers

Rules:
- Extract ALL products found in the text, not just the first one
- If price is not mentioned for a product, don't include it for that product
- Always try to identify if it's a subscription and extract duration
- Prices might be in Rs, ₹, INR - extract just the number
- Features should be merged into description as bullet points (use • character)
- Return ONLY valid JSON array of products, no additional text

Return format:
{
  "products": [
    {
      "title": "Product Name",
      "description": "Description with features:\\n• Feature 1\\n• Feature 2",
      "price": 499,
      "originalPrice": 999,
      "subscriptionDuration": "1 year"
    }
  ]
}`;

      const prompt = `${systemPrompt}\n\nExtract ALL product information from this text:\n\n${text}`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const responseText = response.text();

      logger.info('AI extraction response received');

      // Parse JSON response
      // Remove markdown code blocks if present
      let jsonText = responseText.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/g, '');
      }

      const parsed = JSON.parse(jsonText);
      const products: ExtractedProduct[] = parsed.products || [];

      logger.info(`Extracted ${products.length} products from text`);

      return products;
    } catch (error: any) {
      logger.error('AI extraction failed:', {
        error: error.message,
        stack: error.stack,
      });
      throw new Error(`Failed to extract products: ${error.message}`);
    }
  }
}

export default AIService;
