import prisma from "../config/database"
import { ValidationError, NotFoundError } from "../utils/errors"

interface CreateOrderData {
  productId: string
  buyerName: string
  buyerEmail: string
  buyerPhone?: string
  buyerGstin?: string
  paymentMethod: string
  paymentId: string
}

export class CheckoutService {
  /**
   * Get product details for checkout
   */
  static async getProductForCheckout(productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        storefront: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                storeUrl: true,
              },
            },
          },
        },
      },
    })

    if (!product) {
      throw new NotFoundError("Product not found")
    }

    if (!product.isActive) {
      throw new ValidationError("Product is not available for purchase")
    }

    return {
      product: {
        id: product.id,
        title: product.title,
        description: product.description,
        price: Number(product.price),
        thumbnailUrl: product.thumbnailUrl,
        fileUrl: product.fileUrl,
        seller: {
          id: product.storefront.user.id,
          name: product.storefront.user.name,
          email: product.storefront.user.email,
          storeUrl: product.storefront.user.storeUrl,
        },
        platformFeeMode: product.storefront.platformFeeMode,
      },
      message: "Product details retrieved successfully",
    }
  }

  /**
   * Create order after successful payment
   */
  static async createOrder(data: CreateOrderData, sellerId: string) {
    // Get product details
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
      include: {
        storefront: true,
      },
    })

    if (!product) {
      throw new NotFoundError("Product not found")
    }

    if (!product.isActive) {
      throw new ValidationError("Product is not available for purchase")
    }

    // Check if buyer email matches seller email (prevent self-purchase)
    const seller = await prisma.user.findUnique({
      where: { id: sellerId },
      select: { email: true },
    })

    if (
      seller &&
      seller.email.toLowerCase() === data.buyerEmail.toLowerCase()
    ) {
      throw new ValidationError("You cannot purchase your own product")
    }

    // Calculate amounts
    const baseAmount = Number(product.price)
    const platformFeeMode = product.storefront.platformFeeMode

    // Platform fee (10%) - paid by buyer or seller based on settings
    const platformFee =
      platformFeeMode === "buyer" ? Math.round(baseAmount * 0.1) : 0

    // GST (18%) on base + platform fee
    const amountForGst = baseAmount + platformFee
    const gstAmount = Math.round(amountForGst * 0.18)

    const totalAmount = baseAmount + platformFee + gstAmount

    // Generate download link for file-based products
    const downloadLink = product.fileUrl ? product.fileUrl : null

    // Create order
    const order = await prisma.order.create({
      data: {
        sellerId,
        productId: product.id,
        productTitle: product.title,
        productThumbnail: product.thumbnailUrl,
        productDescription: product.description,
        buyerEmail: data.buyerEmail,
        buyerName: data.buyerName,
        buyerPhone: data.buyerPhone,
        buyerGstin: data.buyerGstin,
        amount: baseAmount,
        gstAmount,
        platformFee: platformFee > 0 ? platformFee : null,
        totalAmount,
        status: "completed", // Mark as completed since payment is already done
        deliveryType: "download", // Default to download for now
        paymentMethod: data.paymentMethod,
        paymentId: data.paymentId,
        downloadCount: 0,
        maxDownloads: 5,
        downloadLink,
      },
    })

    // Update user's total revenue and sales count
    await prisma.user.update({
      where: { id: sellerId },
      data: {
        totalRevenue: {
          increment: baseAmount,
        },
        totalSales: {
          increment: 1,
        },
      },
    })

    // Update product downloads count
    await prisma.product.update({
      where: { id: product.id },
      data: {
        downloads: {
          increment: 1,
        },
      },
    })

    return {
      order: {
        id: order.id,
        productId: order.productId,
        productTitle: order.productTitle,
        productThumbnail: order.productThumbnail,
        buyerEmail: order.buyerEmail,
        buyerName: order.buyerName,
        totalAmount: Number(order.totalAmount),
        downloadLink: order.downloadLink,
        createdAt: order.createdAt.toISOString(),
      },
      message: "Order created successfully",
    }
  }

  /**
   * Record a download
   */
  static async recordDownload(
    orderId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    })

    if (!order) {
      throw new NotFoundError("Order not found")
    }

    if (order.downloadCount >= order.maxDownloads) {
      throw new ValidationError("Maximum download limit reached")
    }

    // Create download log
    await prisma.downloadLog.create({
      data: {
        orderId: order.id,
        productTitle: order.productTitle,
        buyerName: order.buyerName,
        buyerEmail: order.buyerEmail,
        ipAddress,
        userAgent,
      },
    })

    // Increment download count
    await prisma.order.update({
      where: { id: orderId },
      data: {
        downloadCount: {
          increment: 1,
        },
      },
    })

    return {
      message: "Download recorded successfully",
    }
  }

  /**
   * Get order by ID for download page
   */
  static async getOrderForDownload(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    })

    if (!order) {
      throw new NotFoundError("Order not found")
    }

    return {
      order: {
        id: order.id,
        productTitle: order.productTitle,
        productThumbnail: order.productThumbnail,
        productDescription: order.productDescription,
        buyerEmail: order.buyerEmail,
        buyerName: order.buyerName,
        totalAmount: Number(order.totalAmount),
        downloadLink: order.downloadLink,
        downloadCount: order.downloadCount,
        maxDownloads: order.maxDownloads,
        createdAt: order.createdAt.toISOString(),
      },
      message: "Order retrieved successfully",
    }
  }
}
