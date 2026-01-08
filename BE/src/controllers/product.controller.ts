/**
 * Product Controller
 * Handles HTTP requests for product operations
 */

import type { Request, Response, NextFunction } from 'express';
import { ProductService } from '@/services/product.service';
import type { ProductQueryDto } from '@/validators/product.validators';

export class ProductController {
  /**
   * GET /api/products
   * Get all products for the authenticated seller
   */
  static async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const query = req.query as unknown as ProductQueryDto;

      const result = await ProductService.getProducts(userId, query);

      res.json({
        success: true,
        data: result.products,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/products/stats
   * Get product statistics for dashboard
   */
  static async getProductStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;

      const stats = await ProductService.getProductStats(userId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/products/:id
   * Get single product by ID
   */
  static async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const product = await ProductService.getProductById(userId, id);

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/products
   * Create new product
   */
  static async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const productData = req.body;
      const files = req.files as {
        productFile?: Express.Multer.File[];
        thumbnail?: Express.Multer.File[];
      };

      const result = await ProductService.createProduct(userId, productData, {
        productFile: files?.productFile?.[0],
        thumbnail: files?.thumbnail?.[0],
      });

      res.status(201).json({
        success: true,
        data: result.product,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/products/:id
   * Update product
   */
  static async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const productData = req.body;
      const files = req.files as {
        productFile?: Express.Multer.File[];
        thumbnail?: Express.Multer.File[];
      };

      const result = await ProductService.updateProduct(userId, id, productData, {
        productFile: files?.productFile?.[0],
        thumbnail: files?.thumbnail?.[0],
      });

      res.json({
        success: true,
        data: result.product,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/products/:id
   * Delete product
   */
  static async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const result = await ProductService.deleteProduct(userId, id);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/products/:id/toggle-status
   * Toggle product active status
   */
  static async toggleProductStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const result = await ProductService.toggleProductStatus(userId, id);

      res.json({
        success: true,
        data: result.product,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default ProductController;
