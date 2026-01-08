import prisma from '../config/database';

export class SalesService {
  /**
   * Get sales statistics for a seller
   */
  static async getSalesStats(userId: string) {
    // Get all orders for this seller
    const allOrders = await prisma.order.findMany({
      where: { sellerId: userId },
    });

    // Calculate total revenue (completed orders only)
    const completedOrders = allOrders.filter((o) => o.status === 'completed');
    const totalRevenue = completedOrders.reduce(
      (sum, order) => sum + Number(order.totalAmount),
      0
    );

    // Calculate pending amount
    const pendingOrders = allOrders.filter((o) => o.status === 'pending');
    const pendingAmount = pendingOrders.reduce(
      (sum, order) => sum + Number(order.totalAmount),
      0
    );

    // Calculate monthly revenue (current month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyOrders = completedOrders.filter(
      (o) => new Date(o.createdAt) >= startOfMonth
    );
    const monthlyRevenue = monthlyOrders.reduce(
      (sum, order) => sum + Number(order.totalAmount),
      0
    );

    return {
      stats: {
        totalRevenue,
        totalOrders: allOrders.length,
        completedOrders: completedOrders.length,
        pendingAmount,
        monthlyRevenue,
      },
      message: 'Sales statistics retrieved successfully',
    };
  }

  /**
   * Get all orders for a seller with optional filters
   */
  static async getOrders(
    userId: string,
    filters?: {
      status?: 'pending' | 'completed' | 'refunded';
      search?: string;
      sortBy?: 'newest' | 'oldest' | 'amount-high' | 'amount-low';
      skip?: number;
      take?: number;
    }
  ) {
    const where: any = { sellerId: userId };

    // Apply status filter
    if (filters?.status) {
      where.status = filters.status;
    }

    // Apply search filter
    if (filters?.search) {
      where.OR = [
        { productTitle: { contains: filters.search, mode: 'insensitive' } },
        { buyerName: { contains: filters.search, mode: 'insensitive' } },
        { buyerEmail: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Determine sort order
    let orderBy: any = { createdAt: 'desc' }; // Default: newest first
    if (filters?.sortBy === 'oldest') {
      orderBy = { createdAt: 'asc' };
    } else if (filters?.sortBy === 'amount-high') {
      orderBy = { totalAmount: 'desc' };
    } else if (filters?.sortBy === 'amount-low') {
      orderBy = { totalAmount: 'asc' };
    }

    // Get total count
    const total = await prisma.order.count({ where });

    // Get orders
    const orders = await prisma.order.findMany({
      where,
      orderBy,
      skip: filters?.skip || 0,
      take: filters?.take || 100,
    });

    return {
      orders,
      total,
      message: 'Orders retrieved successfully',
    };
  }

  /**
   * Get recent orders (last 7 days)
   */
  static async getRecentOrders(userId: string) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const orders = await prisma.order.findMany({
      where: {
        sellerId: userId,
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      orders,
      message: 'Recent orders retrieved successfully',
    };
  }

  /**
   * Get download logs for a seller
   */
  static async getDownloadLogs(
    userId: string,
    filters?: {
      skip?: number;
      take?: number;
    }
  ) {
    // Get all orders for this seller to get their order IDs
    const sellerOrders = await prisma.order.findMany({
      where: { sellerId: userId },
      select: { id: true },
    });

    const orderIds = sellerOrders.map((o) => o.id);

    // Get download logs for these orders
    const total = await prisma.downloadLog.count({
      where: {
        orderId: { in: orderIds },
      },
    });

    const downloadLogs = await prisma.downloadLog.findMany({
      where: {
        orderId: { in: orderIds },
      },
      orderBy: {
        downloadedAt: 'desc',
      },
      skip: filters?.skip || 0,
      take: filters?.take || 100,
    });

    return {
      downloadLogs,
      total,
      message: 'Download logs retrieved successfully',
    };
  }

  /**
   * Get a single order by ID (only if it belongs to the seller)
   */
  static async getOrderById(userId: string, orderId: string) {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        sellerId: userId,
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    return {
      order,
      message: 'Order retrieved successfully',
    };
  }
}
