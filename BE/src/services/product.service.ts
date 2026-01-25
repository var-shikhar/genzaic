/**
 * Product Service
 * Handles all product-related business logic
 */

import { prisma } from "@/config/database"
import {
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "@/utils/errors"
import { UploadService } from "@/services/upload.service"
import { logger } from "@/utils/logger"
import type {
  CreateProductDto,
  UpdateProductDto,
  ProductQueryDto,
} from "@/validators/product.validators"

export class ProductService {
  /**
   * Get all products for a seller with pagination and filtering
   */
  static async getProducts(userId: string, query: ProductQueryDto) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { storefront: true },
    })

    if (!user || !user.storefront) {
      throw new NotFoundError("Storefront not found")
    }

    const { page, limit, search, isActive, sortBy, sortOrder } = query
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      storefrontId: user.storefront.id,
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { seoKeywords: { contains: search, mode: "insensitive" } },
      ]
    }

    if (isActive !== undefined) {
      where.isActive = isActive
    }

    // Get total count
    const total = await prisma.product.count({ where })

    // Get products
    const products = await prisma.product.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { [sortBy]: sortOrder },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        originalPrice: true,
        thumbnailUrl: true,
        isActive: true,
        stock: true,
        downloads: true,
        views: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    }
  }

  /**
   * Get single product by ID
   */
  static async getProductById(userId: string, productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        storefront: {
          select: {
            userId: true,
            storeName: true,
            storeUrl: true,
          },
        },
      },
    })

    if (!product) {
      throw new NotFoundError("Product not found")
    }

    // Verify ownership
    if (product.storefront.userId !== userId) {
      throw new UnauthorizedError(
        "You do not have permission to access this product"
      )
    }

    return product
  }

  /**
   * Create new product
   */
  static async createProduct(
    userId: string,
    productData: CreateProductDto,
    files?: {
      productFile?: Express.Multer.File
      thumbnail?: Express.Multer.File
    }
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { storefront: true },
    })

    if (!user) {
      throw new NotFoundError("User not found")
    }

    if (user.role !== "seller") {
      throw new ValidationError("Only sellers can create products")
    }

    if (!user.storefront) {
      throw new NotFoundError(
        "Storefront not found. Please complete onboarding first."
      )
    }

    // Create product first to get productId
    const product = await prisma.product.create({
      data: {
        storefrontId: user.storefront.id,
        title: productData.title,
        description: productData.description || "",
        price: productData.price,
        fileUrl: "", // Will be updated after file upload
        thumbnailUrl: null,
        seoTitle: productData.seoTitle || productData.title,
        seoKeywords: productData.seoKeywords || "",
        isActive:
          productData.isActive !== undefined ? productData.isActive : true,
        stock: productData.stock,
      },
    })

    // Upload files after product creation
    let driveFileId: string | null = null
    let driveFileName: string | null = null
    let thumbnailUrl: string | null = null

    try {
      // Handle Product File (Required only for 'download' delivery type)
      if (productData.deliveryType === 'download') {
        if (files?.productFile) {
          const productFileResult = await UploadService.uploadProductFile(
            files.productFile,
            userId,
            product.id
          )
          driveFileId = productFileResult.publicId
          driveFileName = files.productFile.originalname
          logger.info(`Product file uploaded to Drive: ${driveFileId}`)
        } else {
          throw new ValidationError("Product file is required for digital downloads")
          // Cleanup is handled in catch block
        }
      }

      // Upload thumbnail to Cloudinary (optional)
      if (files?.thumbnail) {
        const thumbnailResult = await UploadService.uploadProductThumbnail(
          files.thumbnail
        )
        thumbnailUrl = thumbnailResult.secureUrl
        logger.info(`Thumbnail uploaded: ${thumbnailResult.publicId}`)
      }

      // Update product with file information
      await prisma.product.update({
        where: { id: product.id },
        data: {
          driveFileId,
          driveFileName,
          thumbnailUrl,
          fileUrl: driveFileId || "", // Use driveFileId as fileUrl for now
          deliveryType: productData.deliveryType,
          externalUrl: productData.externalUrl,
          sellerContactEmail: productData.sellerContactEmail,
          sellerContactPhone: productData.sellerContactPhone,
          sellerContactWhatsapp: productData.sellerContactWhatsapp,
          subscriptionDuration: productData.subscriptionDuration,
          originalPrice: productData.originalPrice,
        },
      })
    } catch (error) {
      // Clean up: delete product if file upload fails
      // We check if product exists first to avoid double deletion error
      const productExists = await prisma.product.findUnique({ where: { id: product.id } });
      if (productExists) {
        await prisma.product.delete({ where: { id: product.id } }).catch(() => {})
      }
      
      logger.error("File upload failed:", error)
      throw error // Re-throw the original error instead of wrapping it
    }

    // Update user's total products count
    await prisma.user.update({
      where: { id: userId },
      data: { totalProducts: { increment: 1 } },
    })

    return {
      product,
      message: "Product created successfully",
    }
  }

  /**
   * Update product
   */
  static async updateProduct(
    userId: string,
    productId: string,
    productData: UpdateProductDto,
    files?: {
      productFile?: Express.Multer.File
      thumbnail?: Express.Multer.File
    }
  ) {
    // Verify product exists and user owns it
    // const existingProduct = await this.getProductById(userId, productId)
    console.log("userId", userId)

    // Upload new files if provided
    let driveFileId: string | undefined
    let driveFileName: string | undefined
    let thumbnailUrl: string | undefined

    try {
      if (files?.productFile) {
        const productFileResult = await UploadService.uploadProductFile(
          files.productFile,
          userId,
          productId
        )
        driveFileId = productFileResult.publicId // Drive file ID
        driveFileName = files.productFile.originalname
        logger.info(`Product file updated in Drive: ${driveFileId}`)
      }

      if (files?.thumbnail) {
        const thumbnailResult = await UploadService.uploadProductThumbnail(
          files.thumbnail
        )
        thumbnailUrl = thumbnailResult.secureUrl
        logger.info(`Thumbnail updated: ${thumbnailResult.publicId}`)
      }
    } catch (error) {
      logger.error("File upload failed:", error)
      throw new ValidationError("Failed to upload files. Please try again.")
    }

    // Update product
    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        ...(productData.title && { title: productData.title }),
        ...(productData.description !== undefined && {
          description: productData.description,
        }),
        ...(productData.price && { price: productData.price }),
        ...(productData.seoTitle !== undefined && {
          seoTitle: productData.seoTitle,
        }),
        ...(productData.seoKeywords !== undefined && {
          seoKeywords: productData.seoKeywords,
        }),
        ...(productData.isActive !== undefined && {
          isActive: productData.isActive,
        }),
        ...(productData.stock !== undefined && { stock: productData.stock }),
        ...(driveFileId && { driveFileId, driveFileName, fileUrl: driveFileId }),
        ...(thumbnailUrl && { thumbnailUrl }),
        // New fields
        ...(productData.deliveryType && { deliveryType: productData.deliveryType }),
        ...(productData.externalUrl !== undefined && { externalUrl: productData.externalUrl }),
        ...(productData.sellerContactEmail !== undefined && { sellerContactEmail: productData.sellerContactEmail }),
        ...(productData.sellerContactPhone !== undefined && { sellerContactPhone: productData.sellerContactPhone }),
        ...(productData.sellerContactWhatsapp !== undefined && { sellerContactWhatsapp: productData.sellerContactWhatsapp }),
        ...(productData.subscriptionDuration !== undefined && { subscriptionDuration: productData.subscriptionDuration }),
        ...(productData.originalPrice !== undefined && { originalPrice: productData.originalPrice }),
      },
    })

    return {
      product,
      message: "Product updated successfully",
    }
  }

  /**
   * Delete product
   */
  static async deleteProduct(userId: string, productId: string) {
    // Verify product exists and user owns it
    await this.getProductById(userId, productId)

    // Delete product
    await prisma.product.delete({
      where: { id: productId },
    })

    // Update user's total products count
    await prisma.user.update({
      where: { id: userId },
      data: { totalProducts: { decrement: 1 } },
    })

    return {
      message: "Product deleted successfully",
    }
  }

  /**
   * Toggle product active status
   */
  static async toggleProductStatus(userId: string, productId: string) {
    const product = await this.getProductById(userId, productId)

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { isActive: !product.isActive },
    })

    return {
      product: updatedProduct,
      message: `Product ${updatedProduct.isActive ? "activated" : "deactivated"} successfully`,
    }
  }

  /**
   * Get product stats for dashboard
   */
  static async getProductStats(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { storefront: true },
    })

    if (!user || !user.storefront) {
      throw new NotFoundError("Storefront not found")
    }

    const [totalProducts, activeProducts, totalDownloads, totalViews] =
      await Promise.all([
        prisma.product.count({
          where: { storefrontId: user.storefront.id },
        }),
        prisma.product.count({
          where: { storefrontId: user.storefront.id, isActive: true },
        }),
        prisma.product.aggregate({
          where: { storefrontId: user.storefront.id },
          _sum: { downloads: true },
        }),
        prisma.product.aggregate({
          where: { storefrontId: user.storefront.id },
          _sum: { views: true },
        }),
      ])

    return {
      totalProducts,
      activeProducts,
      inactiveProducts: totalProducts - activeProducts,
      totalDownloads: totalDownloads._sum.downloads || 0,
      totalViews: totalViews._sum.views || 0,
    }
  }

  /**
   * Increment product views
   */
  static async incrementViews(productId: string) {
    await prisma.product.update({
      where: { id: productId },
      data: { views: { increment: 1 } },
    })
  }

  /**
   * Increment product downloads
   */
  static async incrementDownloads(productId: string) {
    await prisma.product.update({
      where: { id: productId },
      data: { downloads: { increment: 1 } },
    })
  }
}

export default ProductService
