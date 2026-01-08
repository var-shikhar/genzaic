/**
 * Product Routes
 * Defines all product-related API endpoints
 */

import { Router } from 'express';
import { ProductController } from '@/controllers/product.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validation.middleware';
import { uploadProductFiles } from '@/middleware/upload.middleware';
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
} from '@/validators/product.validators';

const router = Router();

// All product routes require authentication
router.use(authenticate);

/**
 * GET /api/products/stats
 * Get product statistics
 */
router.get('/stats', ProductController.getProductStats);

/**
 * GET /api/products
 * Get all products with pagination and filtering
 * Query params: page, limit, search, isActive, sortBy, sortOrder
 */
router.get('/', validate(productQuerySchema, 'query'), ProductController.getProducts);

/**
 * GET /api/products/:id
 * Get single product by ID
 */
router.get('/:id', ProductController.getProductById);

/**
 * POST /api/products
 * Create new product (with file uploads)
 */
router.post(
  '/',
  uploadProductFiles,
  validate(createProductSchema),
  ProductController.createProduct
);

/**
 * PUT /api/products/:id
 * Update product (with optional file uploads)
 */
router.put(
  '/:id',
  uploadProductFiles,
  validate(updateProductSchema),
  ProductController.updateProduct
);

/**
 * DELETE /api/products/:id
 * Delete product
 */
router.delete('/:id', ProductController.deleteProduct);

/**
 * PATCH /api/products/:id/toggle-status
 * Toggle product active/inactive status
 */
router.patch('/:id/toggle-status', ProductController.toggleProductStatus);

export default router;
