/**
 * AI Controller
 * Handles HTTP requests for AI-powered features
 */

import type { Request, Response, NextFunction } from 'express';
import { AIService } from '@/services/ai.service';
import { ValidationError } from '@/utils/errors';

export class AIController {
  /**
   * POST /api/ai/parse-product-text
   * Extract product details from WhatsApp/text using AI
   */
  static async parseProductText(req: Request, res: Response, next: NextFunction) {
    try {
      const { text } = req.body;

      if (!text || typeof text !== 'string' || !text.trim()) {
        throw new ValidationError('Text is required');
      }

      const products = await AIService.extractProducts(text);

      res.json({
        success: true,
        products,
        count: products.length,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default AIController;
