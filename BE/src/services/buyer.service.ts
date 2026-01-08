/**
 * Buyer Service
 * Handles buyer-related operations: order linking, fetching purchases, etc.
 */

import prisma from '../config/database';
import { NotFoundError } from '../utils/errors';

export class BuyerService {
  /**
   * Link guest orders to user account when they sign up/login
   * Automatically finds and links any orders made with the user's email
   */
  static async linkGuestOrdersToUser(userEmail: string, userId: string) {
    // Find all guest orders (buyerId is null) with this email
    const linkedOrders = await prisma.order.updateMany({
      where: {
        buyerEmail: userEmail.toLowerCase(),
        buyerId: null, // Only link guest orders
      },
      data: {
        buyerId: userId,
      },
    });

    return {
      linkedCount: linkedOrders.count,
      message: linkedOrders.count > 0
        ? `${linkedOrders.count} past order(s) linked to your account`
        : 'No past orders found',
    };
  }

  /**
   * Get all orders for a buyer (logged-in user)
   */
  static async getBuyerOrders(buyerId: string) {
    const orders = await prisma.order.findMany({
      where: {
        buyerId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            thumbnailUrl: true,
            storefront: {
              select: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    storeUrl: true,
                    email: true,
                  },
                },
                contactWhatsapp: true,
                contactPhone: true,
              },
            },
          },
        },
      },
    });

    // Transform to match frontend expectations
    const formattedOrders = orders.map((order) => ({
      id: order.id,
      productId: order.productId,
      productTitle: order.productTitle,
      productThumbnail: order.productThumbnail,
      productDescription: order.productDescription,
      totalAmount: Number(order.totalAmount),
      status: order.status,
      deliveryType: order.deliveryType,
      deliveryStatus: order.deliveryStatus,
      externalUrl: order.externalUrl,
      downloadCount: order.downloadCount,
      maxDownloads: order.maxDownloads,
      downloadLink: order.downloadLink,
      purchasedAt: order.createdAt.toISOString(),
      sellerName: order.product.storefront.user.name,
      sellerEmail: order.product.storefront.user.email,
      sellerStoreUrl: order.product.storefront.user.storeUrl,
      sellerWhatsapp: order.product.storefront.contactWhatsapp,
      sellerPhone: order.product.storefront.contactPhone,
    }));

    return {
      orders: formattedOrders,
      total: formattedOrders.length,
      message: 'Orders retrieved successfully',
    };
  }

  /**
   * Get a single order for a buyer (with verification)
   */
  static async getBuyerOrder(orderId: string, buyerId: string) {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        buyerId, // Ensure user owns this order
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            description: true,
            thumbnailUrl: true,
            storefront: {
              select: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    storeUrl: true,
                  },
                },
                contactEmail: true,
                contactPhone: true,
                contactWhatsapp: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundError('Order not found or access denied');
    }

    return {
      order: {
        id: order.id,
        productId: order.productId,
        productTitle: order.productTitle,
        productThumbnail: order.productThumbnail,
        productDescription: order.productDescription,
        buyerName: order.buyerName,
        buyerEmail: order.buyerEmail,
        buyerPhone: order.buyerPhone,
        buyerGstin: order.buyerGstin,
        amount: Number(order.amount),
        gstAmount: Number(order.gstAmount),
        platformFee: order.platformFee ? Number(order.platformFee) : null,
        totalAmount: Number(order.totalAmount),
        status: order.status,
        deliveryType: order.deliveryType,
        deliveryStatus: order.deliveryStatus,
        externalUrl: order.externalUrl,
        paymentMethod: order.paymentMethod,
        paymentId: order.paymentId,
        downloadCount: order.downloadCount,
        maxDownloads: order.maxDownloads,
        downloadLink: order.downloadLink,
        createdAt: order.createdAt.toISOString(),
        sellerName: order.product.storefront.user.name,
        sellerEmail: order.product.storefront.contactEmail || order.product.storefront.user.email,
        sellerStoreUrl: order.product.storefront.user.storeUrl,
        sellerPhone: order.product.storefront.contactPhone,
        sellerWhatsapp: order.product.storefront.contactWhatsapp,
      },
      message: 'Order retrieved successfully',
    };
  }
}
