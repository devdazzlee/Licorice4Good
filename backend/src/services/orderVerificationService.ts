import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

export interface VerificationResult {
  isValid: boolean;
  riskScore: number; // 0-100, higher = more risky
  flags: string[];
  autoApprove: boolean;
  recommendations: string[];
}

export interface OrderVerificationData {
  orderId: string;
  userId: string;
  total: number;
  paymentStatus: string;
  userEmail?: string;
  userCreatedAt?: Date;
  orderItems: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
}

class OrderVerificationService {
  private readonly HIGH_RISK_THRESHOLD = 70;
  private readonly AUTO_APPROVE_THRESHOLD = 30;
  private readonly MAX_ORDER_VALUE_NEW_USER = 500;
  private readonly MAX_ORDERS_PER_HOUR = 10;

  /**
   * Comprehensive order verification with fraud detection
   */
  async verifyOrder(
    orderData: OrderVerificationData
  ): Promise<VerificationResult> {
    const flags: string[] = [];
    const recommendations: string[] = [];
    let riskScore = 0;

    try {
      // 1. User verification checks
      const userRisk = await this.checkUserRisk(
        orderData.userId,
        orderData.userEmail
      );
      riskScore += userRisk.score;
      flags.push(...userRisk.flags);

      // 2. Order value analysis
      const valueRisk = await this.checkOrderValue(
        orderData.total,
        orderData.userId
      );
      riskScore += valueRisk.score;
      flags.push(...valueRisk.flags);

      // 3. Frequency analysis
      const frequencyRisk = await this.checkOrderFrequency(orderData.userId);
      riskScore += frequencyRisk.score;
      flags.push(...frequencyRisk.flags);

      // 4. Payment verification
      const paymentRisk = this.checkPaymentStatus(orderData.paymentStatus);
      riskScore += paymentRisk.score;
      flags.push(...paymentRisk.flags);

      // 5. Product analysis
      const productRisk = await this.checkProductRisk(orderData.orderItems);
      riskScore += productRisk.score;
      flags.push(...productRisk.flags);

      // 6. Geographic and pattern analysis
      const patternRisk = await this.checkOrderPatterns(orderData.userId);
      riskScore += patternRisk.score;
      flags.push(...patternRisk.flags);

      // Generate recommendations
      recommendations.push(...this.generateRecommendations(riskScore, flags));

      const result: VerificationResult = {
        isValid: riskScore < this.HIGH_RISK_THRESHOLD,
        riskScore: Math.min(riskScore, 100),
        flags,
        autoApprove: riskScore <= this.AUTO_APPROVE_THRESHOLD,
        recommendations,
      };

      // Log high-risk orders for manual review
      if (riskScore >= this.HIGH_RISK_THRESHOLD) {
        await this.logHighRiskOrder(orderData, result);
      }

      return result;
    } catch (error) {
      console.error("Order verification error:", error);
      return {
        isValid: false,
        riskScore: 100,
        flags: ["VERIFICATION_ERROR"],
        autoApprove: false,
        recommendations: ["Manual review required due to verification error"],
      };
    }
  }

  /**
   * Check user-related risk factors
   */
  private async checkUserRisk(
    userId: string,
    userEmail?: string
  ): Promise<{ score: number; flags: string[] }> {
    const flags: string[] = [];
    let score = 0;

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          orders: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      });

      if (!user) {
        flags.push("USER_NOT_FOUND");
        return { score: 50, flags };
      }

      // New user risk
      const accountAge = Date.now() - new Date(user.createdAt).getTime();
      const daysSinceCreation = accountAge / (1000 * 60 * 60 * 24);

      if (daysSinceCreation < 1) {
        flags.push("NEW_USER_24H");
        score += 20;
      } else if (daysSinceCreation < 7) {
        flags.push("NEW_USER_WEEK");
        score += 10;
      }

      // Email verification
      if (!user.isVerified) {
        flags.push("EMAIL_NOT_VERIFIED");
        score += 15;
      }

      // Order history analysis
      if (user.orders.length === 0) {
        flags.push("FIRST_ORDER");
        score += 10;
      } else {
        // Check for previous failed payments
        const failedOrders = user.orders.filter(
          (order) => order.paymentStatus === "failed"
        );
        if (failedOrders.length > 0) {
          flags.push("PREVIOUS_PAYMENT_FAILURES");
          score += failedOrders.length * 5;
        }

        // Check for cancelled orders
        const cancelledOrders = user.orders.filter(
          (order) => order.status === "cancelled"
        );
        if (cancelledOrders.length > 2) {
          flags.push("MULTIPLE_CANCELLATIONS");
          score += 10;
        }
      }

      return { score, flags };
    } catch (error) {
      console.error("User risk check error:", error);
      return { score: 30, flags: ["USER_CHECK_ERROR"] };
    }
  }

  /**
   * Analyze order value for risk factors
   */
  private async checkOrderValue(
    total: number,
    userId: string
  ): Promise<{ score: number; flags: string[] }> {
    const flags: string[] = [];
    let score = 0;

    // High value orders
    if (total > 1000) {
      flags.push("HIGH_VALUE_ORDER");
      score += 20;
    } else if (total > 500) {
      flags.push("MEDIUM_VALUE_ORDER");
      score += 10;
    }

    // Check if this is unusually high for the user
    try {
      const userOrders = await prisma.order.findMany({
        where: { userId, paymentStatus: "paid" },
        select: { total: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      });

      if (userOrders.length > 0) {
        const avgOrderValue =
          userOrders.reduce((sum, order) => sum + order.total, 0) /
          userOrders.length;
        const maxOrderValue = Math.max(
          ...userOrders.map((order) => order.total)
        );

        if (total > avgOrderValue * 3) {
          flags.push("UNUSUAL_HIGH_VALUE");
          score += 15;
        }

        if (total > maxOrderValue * 2) {
          flags.push("EXCEEDS_HISTORICAL_MAX");
          score += 10;
        }
      }
    } catch (error) {
      console.error("Order value check error:", error);
    }

    return { score, flags };
  }

  /**
   * Check order frequency patterns
   */
  private async checkOrderFrequency(
    userId: string
  ): Promise<{ score: number; flags: string[] }> {
    const flags: string[] = [];
    let score = 0;

    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const [recentOrders, dailyOrders] = await Promise.all([
        prisma.order.count({
          where: {
            userId,
            createdAt: { gte: oneHourAgo },
          },
        }),
        prisma.order.count({
          where: {
            userId,
            createdAt: { gte: oneDayAgo },
          },
        }),
      ]);

      if (recentOrders >= this.MAX_ORDERS_PER_HOUR) {
        flags.push("EXCESSIVE_HOURLY_ORDERS");
        score += 30;
      } else if (recentOrders >= 5) {
        flags.push("HIGH_HOURLY_FREQUENCY");
        score += 15;
      }

      if (dailyOrders >= 20) {
        flags.push("EXCESSIVE_DAILY_ORDERS");
        score += 25;
      } else if (dailyOrders >= 10) {
        flags.push("HIGH_DAILY_FREQUENCY");
        score += 10;
      }
    } catch (error) {
      console.error("Order frequency check error:", error);
    }

    return { score, flags };
  }

  /**
   * Verify payment status
   */
  private checkPaymentStatus(paymentStatus: string): {
    score: number;
    flags: string[];
  } {
    const flags: string[] = [];
    let score = 0;

    switch (paymentStatus) {
      case "paid":
        // Paid orders are low risk
        break;
      case "pending":
        flags.push("PAYMENT_PENDING");
        score += 5;
        break;
      case "failed":
        flags.push("PAYMENT_FAILED");
        score += 40;
        break;
      default:
        flags.push("UNKNOWN_PAYMENT_STATUS");
        score += 20;
    }

    return { score, flags };
  }

  /**
   * Analyze product combinations for suspicious patterns
   */
  private async checkProductRisk(
    orderItems: Array<{ productId: string; quantity: number; price: number }>
  ): Promise<{ score: number; flags: string[] }> {
    const flags: string[] = [];
    let score = 0;

    // Check for unusual quantities
    const totalQuantity = orderItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    if (totalQuantity > 50) {
      flags.push("BULK_ORDER");
      score += 15;
    } else if (totalQuantity > 20) {
      flags.push("LARGE_QUANTITY");
      score += 5;
    }

    // Check for price inconsistencies
    const priceVariance = this.calculatePriceVariance(orderItems);
    if (priceVariance > 0.5) {
      flags.push("PRICE_INCONSISTENCY");
      score += 10;
    }

    return { score, flags };
  }

  /**
   * Check for suspicious ordering patterns
   */
  private async checkOrderPatterns(
    userId: string
  ): Promise<{ score: number; flags: string[] }> {
    const flags: string[] = [];
    let score = 0;

    try {
      // Check for rapid successive orders
      const recentOrders = await prisma.order.findMany({
        where: {
          userId,
          createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) }, // Last 10 minutes
        },
        orderBy: { createdAt: "desc" },
      });

      if (recentOrders.length > 3) {
        flags.push("RAPID_SUCCESSIVE_ORDERS");
        score += 25;
      }

      // Check for identical order patterns
      if (recentOrders.length > 1) {
        const identicalOrders = this.findIdenticalOrders(recentOrders);
        if (identicalOrders > 1) {
          flags.push("DUPLICATE_ORDERS");
          score += 20;
        }
      }
    } catch (error) {
      console.error("Order pattern check error:", error);
    }

    return { score, flags };
  }

  /**
   * Generate recommendations based on risk assessment
   */
  private generateRecommendations(
    riskScore: number,
    flags: string[]
  ): string[] {
    const recommendations: string[] = [];

    if (riskScore >= this.HIGH_RISK_THRESHOLD) {
      recommendations.push("HOLD_FOR_MANUAL_REVIEW");
      recommendations.push("CONTACT_CUSTOMER_VERIFICATION");
    } else if (riskScore >= 40) {
      recommendations.push("ENHANCED_MONITORING");
      recommendations.push("DELAY_FULFILLMENT_24H");
    }

    if (flags.includes("EMAIL_NOT_VERIFIED")) {
      recommendations.push("REQUIRE_EMAIL_VERIFICATION");
    }

    if (flags.includes("PAYMENT_FAILED")) {
      recommendations.push("RETRY_PAYMENT_REQUIRED");
    }

    if (flags.includes("NEW_USER_24H")) {
      recommendations.push("NEW_USER_VERIFICATION");
    }

    if (flags.includes("BULK_ORDER")) {
      recommendations.push("VERIFY_BUSINESS_ACCOUNT");
    }

    if (riskScore <= this.AUTO_APPROVE_THRESHOLD) {
      recommendations.push("AUTO_APPROVE_SAFE");
    }

    return recommendations;
  }

  /**
   * Log high-risk orders for manual review
   */
  private async logHighRiskOrder(
    orderData: OrderVerificationData,
    result: VerificationResult
  ): Promise<void> {
    try {
      // In a production system, this might write to a separate audit table
      // or send alerts to administrators
      console.warn("HIGH RISK ORDER DETECTED:", {
        orderId: orderData.orderId,
        userId: orderData.userId,
        riskScore: result.riskScore,
        flags: result.flags,
        total: orderData.total,
        timestamp: new Date().toISOString(),
      });

      // Could also integrate with external fraud detection services here
    } catch (error) {
      console.error("Failed to log high-risk order:", error);
    }
  }

  /**
   * Calculate price variance in order items
   */
  private calculatePriceVariance(orderItems: Array<{ price: number }>): number {
    if (orderItems.length <= 1) return 0;

    const prices = orderItems.map((item) => item.price);
    const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const variance =
      prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) /
      prices.length;

    return Math.sqrt(variance) / mean; // Coefficient of variation
  }

  /**
   * Find identical orders in a list
   */
  private findIdenticalOrders(
    orders: Array<{ total: number; orderItems?: any[] }>
  ): number {
    const orderSignatures = new Map<string, number>();

    for (const order of orders) {
      const signature = `${order.total}-${order.orderItems?.length || 0}`;
      orderSignatures.set(signature, (orderSignatures.get(signature) || 0) + 1);
    }

    return Math.max(...orderSignatures.values()) - 1; // Subtract 1 to get duplicates
  }

  /**
   * Batch verification for multiple orders (for high-volume processing)
   */
  async batchVerifyOrders(
    orderDataList: OrderVerificationData[]
  ): Promise<Map<string, VerificationResult>> {
    const results = new Map<string, VerificationResult>();

    // Process in chunks to avoid overwhelming the database
    const chunkSize = 50;
    for (let i = 0; i < orderDataList.length; i += chunkSize) {
      const chunk = orderDataList.slice(i, i + chunkSize);

      const chunkPromises = chunk.map(async (orderData) => {
        const result = await this.verifyOrder(orderData);
        return { orderId: orderData.orderId, result };
      });

      const chunkResults = await Promise.all(chunkPromises);

      for (const { orderId, result } of chunkResults) {
        results.set(orderId, result);
      }
    }

    return results;
  }
}

export const orderVerificationService = new OrderVerificationService();
export default OrderVerificationService;
