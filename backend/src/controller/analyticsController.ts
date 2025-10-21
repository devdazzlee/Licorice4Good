import { Request, Response } from "express";
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

// Get dashboard analytics data
export const getDashboardAnalytics = async (req: Request, res: Response) => {
  try {
    // Check if user is admin
    const user = (req as any).user;
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { timeRange = "today" } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (timeRange) {
      case "today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "yesterday":
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        startDate = new Date(
          yesterday.getFullYear(),
          yesterday.getMonth(),
          yesterday.getDate()
        );
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);
        break;
      case "week":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay());
        startDate.setHours(0, 0, 0, 0);
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    // Run all analytics queries in parallel
    const [orders, hourlyData, paymentStats, topProducts, riskData] =
      await Promise.all([
        // Basic order stats
        prisma.order.findMany({
          where: {
            createdAt: {
              gte: startDate,
              ...(timeRange === "yesterday" ? { lt: endDate } : {}),
            },
          },
          select: {
            id: true,
            total: true,
            status: true,
            paymentStatus: true,
            createdAt: true,
          },
        }),

        // Hourly breakdown
        getHourlyStats(startDate, endDate),

        // Payment statistics
        getPaymentStats(startDate, endDate),

        // Top products
        getTopProducts(startDate, endDate),

        // Risk assessment data (simulated for now)
        getRiskStats(startDate, endDate),
      ]);

    // Calculate key metrics
    const totalOrders = orders.length;
    const totalRevenue = orders
      .filter((order) => order.paymentStatus === "paid")
      .reduce((sum, order) => sum + order.total, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate conversion rate (simplified - orders vs estimated visitors)
    // In a real system, you'd track actual visitor data
    const estimatedVisitors = Math.max(totalOrders * 10, 1);
    const conversionRate = totalOrders / estimatedVisitors;

    const analyticsData = {
      todayStats: {
        totalOrders,
        totalRevenue,
        averageOrderValue,
        conversionRate,
      },
      hourlyStats: hourlyData,
      riskStats: riskData,
      topProducts,
      paymentStats,
    };

    res.json(analyticsData);
  } catch (err) {
    console.error("Analytics dashboard error:", err);
    res.status(500).json({ message: "Error fetching analytics data" });
  }
};

// Get hourly statistics
async function getHourlyStats(startDate: Date, endDate: Date) {
  try {
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          ...(endDate.getTime() !== new Date().getTime()
            ? { lt: endDate }
            : {}),
        },
      },
      select: {
        createdAt: true,
        total: true,
        paymentStatus: true,
      },
    });

    // Group by hour
    const hourlyMap = new Map<number, { orders: number; revenue: number }>();

    // Initialize all 24 hours
    for (let i = 0; i < 24; i++) {
      hourlyMap.set(i, { orders: 0, revenue: 0 });
    }

    orders.forEach((order) => {
      const hour = new Date(order.createdAt).getHours();
      const current = hourlyMap.get(hour) || { orders: 0, revenue: 0 };
      current.orders += 1;
      if (order.paymentStatus === "paid") {
        current.revenue += order.total;
      }
      hourlyMap.set(hour, current);
    });

    return Array.from(hourlyMap.entries()).map(([hour, stats]) => ({
      hour,
      orders: stats.orders,
      revenue: stats.revenue,
    }));
  } catch (error) {
    console.error("Hourly stats error:", error);
    return Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      orders: 0,
      revenue: 0,
    }));
  }
}

// Get payment statistics
async function getPaymentStats(startDate: Date, endDate: Date) {
  try {
    const paymentCounts = await prisma.order.groupBy({
      by: ["paymentStatus"],
      where: {
        createdAt: {
          gte: startDate,
          ...(endDate.getTime() !== new Date().getTime()
            ? { lt: endDate }
            : {}),
        },
      },
      _count: {
        paymentStatus: true,
      },
    });

    const stats = {
      paid: 0,
      pending: 0,
      failed: 0,
      retrySuccess: 0,
    };

    paymentCounts.forEach((item) => {
      switch (item.paymentStatus) {
        case "paid":
          stats.paid = item._count.paymentStatus;
          break;
        case "pending":
          stats.pending = item._count.paymentStatus;
          break;
        case "failed":
          stats.failed = item._count.paymentStatus;
          break;
      }
    });

    // Calculate retry success (orders that were failed but now paid)
    // This is a simplified calculation - in practice you'd track retry attempts
    stats.retrySuccess = Math.floor(stats.paid * 0.1); // Estimate 10% are retries

    return stats;
  } catch (error) {
    console.error("Payment stats error:", error);
    return { paid: 0, pending: 0, failed: 0, retrySuccess: 0 };
  }
}

// Get top performing products
async function getTopProducts(startDate: Date, endDate: Date) {
  try {
    const topProducts = await prisma.orderItem.groupBy({
      by: ["productId"],
      where: {
        order: {
          createdAt: {
            gte: startDate,
            ...(endDate.getTime() !== new Date().getTime()
              ? { lt: endDate }
              : {}),
          },
          paymentStatus: "paid",
        },
      },
      _sum: {
        quantity: true,
        total: true,
      },
      orderBy: {
        _sum: {
          total: "desc",
        },
      },
      take: 5,
    });

    // Get product details for the top products
    // Filter out null productIds (custom packs)
    const productIds = topProducts
      .map((item) => item.productId)
      .filter((id): id is string => id !== null);
    
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true },
    });

    const productMap = new Map(products.map((p) => [p.id, p.name]));

    return topProducts.map((item) => ({
      productName: item.productId ? (productMap.get(item.productId) || item.productId) : "Custom Pack",
      quantity: item._sum.quantity || 0,
      revenue: item._sum.total || 0,
    }));
  } catch (error) {
    console.error("Top products error:", error);
    return [];
  }
}

// Get risk assessment statistics (simulated for now)
async function getRiskStats(startDate: Date, endDate: Date) {
  try {
    const totalOrders = await prisma.order.count({
      where: {
        createdAt: {
          gte: startDate,
          ...(endDate.getTime() !== new Date().getTime()
            ? { lt: endDate }
            : {}),
        },
      },
    });

    // In a real implementation, you'd have a risk assessment table
    // For now, we'll simulate based on order patterns
    const newUserOrders = await prisma.order.count({
      where: {
        createdAt: {
          gte: startDate,
          ...(endDate.getTime() !== new Date().getTime()
            ? { lt: endDate }
            : {}),
        },
        user: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Users created in last 7 days
          },
        },
      },
    });

    const failedPayments = await prisma.order.count({
      where: {
        createdAt: {
          gte: startDate,
          ...(endDate.getTime() !== new Date().getTime()
            ? { lt: endDate }
            : {}),
        },
        paymentStatus: "failed",
      },
    });

    const highValueOrders = await prisma.order.count({
      where: {
        createdAt: {
          gte: startDate,
          ...(endDate.getTime() !== new Date().getTime()
            ? { lt: endDate }
            : {}),
        },
        total: {
          gt: 500, // Orders over $500
        },
      },
    });

    // Simulate risk categorization
    const autoApproved = Math.max(
      0,
      totalOrders - newUserOrders - failedPayments - highValueOrders
    );
    const manualReview = newUserOrders + Math.floor(highValueOrders * 0.5);
    const highRisk = failedPayments + Math.floor(highValueOrders * 0.3);

    return {
      autoApproved,
      manualReview,
      highRisk,
      totalProcessed: totalOrders,
    };
  } catch (error) {
    console.error("Risk stats error:", error);
    return {
      autoApproved: 0,
      manualReview: 0,
      highRisk: 0,
      totalProcessed: 0,
    };
  }
}

// Get real-time metrics for high-traffic monitoring
export const getRealTimeMetrics = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    const [ordersLastHour, ordersLastFiveMinutes, activeUsers, serverLoad] =
      await Promise.all([
        prisma.order.count({
          where: {
            createdAt: { gte: oneHourAgo },
          },
        }),

        prisma.order.count({
          where: {
            createdAt: { gte: fiveMinutesAgo },
          },
        }),

        // Approximate active users (users who placed orders recently)
        prisma.order
          .groupBy({
            by: ["userId"],
            where: {
              createdAt: { gte: oneHourAgo },
            },
          })
          .then((result) => result.length),

        // Simulate server load metrics
        Promise.resolve({
          cpu: Math.random() * 100,
          memory: Math.random() * 100,
          database: Math.random() * 100,
        }),
      ]);

    const metrics = {
      ordersPerHour: ordersLastHour,
      ordersPerMinute: Math.round(ordersLastFiveMinutes / 5),
      activeUsers,
      serverLoad,
      timestamp: now.toISOString(),
    };

    res.json(metrics);
  } catch (err) {
    console.error("Real-time metrics error:", err);
    res.status(500).json({ message: "Error fetching real-time metrics" });
  }
};

// Get order verification insights
export const getVerificationInsights = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { timeRange = "today" } = req.query;

    // This would integrate with the order verification service
    // For now, we'll provide sample insights
    const insights = {
      flaggedOrders: [
        {
          orderId: "sample-order-1",
          userId: "sample-user-1",
          riskScore: 85,
          flags: ["NEW_USER_24H", "HIGH_VALUE_ORDER", "UNUSUAL_HIGH_VALUE"],
          total: 750.0,
          createdAt: new Date().toISOString(),
        },
        {
          orderId: "sample-order-2",
          userId: "sample-user-2",
          riskScore: 65,
          flags: ["BULK_ORDER", "RAPID_SUCCESSIVE_ORDERS"],
          total: 250.0,
          createdAt: new Date().toISOString(),
        },
      ],
      automationStats: {
        totalProcessed: 1250,
        autoApproved: 1100,
        flaggedForReview: 120,
        blocked: 30,
        falsePositives: 5,
        accuracy: 96.2,
      },
      commonFlags: [
        {
          flag: "NEW_USER_24H",
          count: 45,
          description: "User account created within 24 hours",
        },
        {
          flag: "HIGH_VALUE_ORDER",
          count: 32,
          description: "Order value exceeds $500",
        },
        {
          flag: "EMAIL_NOT_VERIFIED",
          count: 28,
          description: "User email not verified",
        },
        { flag: "BULK_ORDER", count: 15, description: "Large quantity order" },
        {
          flag: "PAYMENT_FAILED",
          count: 12,
          description: "Payment processing failed",
        },
      ],
    };

    res.json(insights);
  } catch (err) {
    console.error("Verification insights error:", err);
    res.status(500).json({ message: "Error fetching verification insights" });
  }
};
