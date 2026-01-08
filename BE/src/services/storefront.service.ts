/**
 * Storefront Service
 * Business logic for storefront operations
 */

import { prisma } from "@/config/database"
import { NotFoundError, ValidationError } from "@/utils/errors"
import {
  UpdateStorefrontDto,
  StorefrontQueryDto,
} from "@/validators/storefront.validators"
import { UploadService } from "./upload.service"

export class StorefrontService {
  /**
   * Get storefront by user ID
   */
  static async getStorefront(userId: string, query?: StorefrontQueryDto) {
    // Get user with storefront
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        storefront: {
          include: {
            products: query?.includeProducts
              ? {
                  where: { isActive: true },
                  take: query.productsLimit || 10,
                  orderBy: { createdAt: "desc" },
                  select: {
                    id: true,
                    title: true,
                    description: true,
                    price: true,
                    thumbnailUrl: true,
                    isActive: true,
                    views: true,
                    downloads: true,
                    createdAt: true,
                  },
                }
              : false,
          },
        },
      },
    })

    if (!user?.storefront) {
      throw new NotFoundError("Storefront not found")
    }

    return {
      storefront: user.storefront,
      message: "Storefront retrieved successfully",
    }
  }

  /**
   * Get public storefront by slug
   */
  static async getPublicStorefront(slug: string) {
    const storefront = await prisma.storefront.findUnique({
      where: { storeUrl: slug, isPublished: true },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        products: {
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            thumbnailUrl: true,
            views: true,
            downloads: true,
            seoTitle: true,
            seoKeywords: true,
            createdAt: true,
          },
        },
      },
    })

    if (!storefront) {
      throw new NotFoundError("Storefront not found or not published")
    }

    return {
      storefront,
      message: "Public storefront retrieved successfully",
    }
  }

  /**
   * Update storefront details
   */
  static async updateStorefront(
    userId: string,
    storefrontData: UpdateStorefrontDto,
    files?: {
      coverImage?: Express.Multer.File
      profileImage?: Express.Multer.File
    }
  ) {
    // Get user with storefront
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { storefront: true },
    })

    if (!user?.storefront) {
      throw new NotFoundError("Storefront not found")
    }

    const storefrontId = user.storefront.id
    const updateData: any = { ...storefrontData }

    // Upload cover image if provided
    if (files?.coverImage) {
      try {
        const uploadResult = await UploadService.uploadCoverImage(
          files.coverImage
        )
        updateData.coverImageUrl = uploadResult.secureUrl
      } catch (error) {
        throw new ValidationError("Failed to upload cover image")
      }
    }

    // Upload profile image if provided
    if (files?.profileImage) {
      try {
        const uploadResult = await UploadService.uploadProfileImage(
          files.profileImage
        )
        updateData.profileImageUrl = uploadResult.secureUrl
      } catch (error) {
        throw new ValidationError("Failed to upload profile image")
      }
    }

    // Update storefront
    const storefront = await prisma.storefront.update({
      where: { id: storefrontId },
      data: updateData,
    })

    return {
      storefront,
      message: "Storefront updated successfully",
    }
  }

  /**
   * Publish/Unpublish storefront
   */
  static async togglePublishStatus(userId: string) {
    // Get user with storefront
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { storefront: true },
    })

    if (!user?.storefront) {
      throw new NotFoundError("Storefront not found")
    }

    // Validate storefront has minimum required info before publishing
    if (!user.storefront.isPublished) {
      if (!user.storefront.storeName) {
        throw new ValidationError(
          "Store name is required to publish storefront"
        )
      }
      if (!user.storefront.storeUrl) {
        throw new ValidationError("Store URL is required to publish storefront")
      }
    }

    // Toggle publish status
    const storefront = await prisma.storefront.update({
      where: { id: user.storefront.id },
      data: {
        isPublished: !user.storefront.isPublished,
      },
    })

    return {
      storefront,
      message: `Storefront ${storefront.isPublished ? "published" : "unpublished"} successfully`,
    }
  }

  /**
   * Get storefront stats
   */
  static async getStorefrontStats(userId: string) {
    // Get user with storefront
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        storefront: {
          include: {
            products: {
              select: {
                views: true,
                downloads: true,
                price: true,
                isActive: true,
              },
            },
          },
        },
      },
    })

    if (!user?.storefront) {
      throw new NotFoundError("Storefront not found")
    }

    // Calculate stats
    const totalProducts = user.storefront.products.length
    const activeProducts = user.storefront.products.filter(
      (p) => p.isActive
    ).length
    const totalViews = user.storefront.products.reduce(
      (sum, p) => sum + p.views,
      0
    )
    const totalDownloads = user.storefront.products.reduce(
      (sum, p) => sum + p.downloads,
      0
    )

    const totalRevenue = user.storefront.products.reduce(
      (sum: number, p) => sum + Number(p.price) * p.downloads,
      0
    )

    return {
      stats: {
        totalProducts,
        activeProducts,
        totalViews,
        totalDownloads,
        totalRevenue,
        isPublished: user.storefront.isPublished,
        slug: user.storefront.storeUrl,
      },
      message: "Storefront stats retrieved successfully",
    }
  }

  /**
   * Check if slug is available
   */
  static async checkSlugAvailability(slug: string, excludeUserId?: string) {
    const storefront = await prisma.storefront.findUnique({
      where: { storeUrl: slug },
      include: { user: true },
    })

    // Slug is available if not found OR if found but belongs to the same user
    const isAvailable =
      !storefront || (excludeUserId && storefront.user.id === excludeUserId)

    return {
      available: isAvailable,
      message: isAvailable ? "Slug is available" : "Slug is already taken",
    }
  }
}

export default StorefrontService
