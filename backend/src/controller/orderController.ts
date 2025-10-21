import { Request, Response } from "express";
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

// Create order from cart or direct order items (checkout)
export const createOrder = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const guestId = (req as any).guestId;
    const isGuest = (req as any).isGuest;

    // For authenticated users, verify they exist in database
    let dbUser = null;
    if (!isGuest && user) {
      dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { id: true, email: true, isVerified: true },
      });

      if (!dbUser) {
        return res.status(404).json({ message: "User not found" });
      }
    }

    const {
      shippingAddress,
      orderNotes,
      orderItems,
      total: requestTotal,
      guestEmail,
    } = req.body;

    // Define user identifier once for the entire function
    const userIdentifier = isGuest ? { guestId } : { userId: dbUser?.id };

    // Shipping address validation - allow empty since Stripe will collect it
    // If shippingAddress is provided, validate it, otherwise allow empty (Stripe will collect)
    if (shippingAddress && typeof shippingAddress === "object") {
      const { street, city, state, zipCode, country } = shippingAddress;

      // If any field is provided, all required fields must be provided
      if (street || city || state || zipCode || country) {
        if (!street || !city || !state || !zipCode || !country) {
          return res.status(400).json({
            message:
              "All shipping address fields are required: street, city, state, zipCode, and country",
          });
        }

        if (
          street.trim() === "" ||
          city.trim() === "" ||
          state.trim() === "" ||
          zipCode.trim() === ""
        ) {
          return res.status(400).json({
            message: "Shipping address fields cannot be empty",
          });
        }
      }
    }

    let orderItemsToCreate: any[] = [];
    let calculatedTotal = 0;
    let cartLines: any[] = []; // Store cart lines for inventory updates

    // Check if frontend sent orderItems directly (new approach)
    if (orderItems && Array.isArray(orderItems) && orderItems.length > 0) {
      // Validate and process direct order items
      for (const item of orderItems) {
        if (!item.productId || !item.quantity || !item.price) {
          return res.status(400).json({
            message:
              "Invalid order item: productId, quantity, and price are required",
          });
        }

        // Handle custom packs differently from regular products
        if (item.productId === "3-pack" && item.isCustomPack) {
          // For custom packs, validate flavors exist and have sufficient stock
          if (
            !item.flavorIds ||
            !Array.isArray(item.flavorIds) ||
            item.flavorIds.length !== 3
          ) {
            return res.status(400).json({
              message: "Custom pack must have exactly 3 flavors",
            });
          }

          // Check if flavors exist and have sufficient stock
          const flavors = await prisma.flavor.findMany({
            where: { id: { in: item.flavorIds }, active: true },
            include: { inventory: true },
          });

          if (flavors.length !== 3) {
            return res.status(400).json({
              message: "One or more flavors in custom pack are not available",
            });
          }

          // Check inventory for each flavor
          for (const flavor of flavors) {
            const inventory = flavor.inventory;
            if (!inventory) {
              return res.status(400).json({
                message: `No inventory found for flavor: ${flavor.name}`,
              });
            }

            const available =
              inventory.onHand - inventory.reserved - inventory.safetyStock;
            if (available < item.quantity) {
              return res.status(400).json({
                message: `Insufficient stock for ${flavor.name}. Available: ${available}, Requested: ${item.quantity}`,
              });
            }
          }
        } else {
          // Handle regular products
          const product = await prisma.product.findUnique({
            where: { id: item.productId, isActive: true },
          });

          if (!product) {
            return res.status(400).json({
              message: `Product not found: ${item.productId}`,
            });
          }

          if (product.stock < item.quantity) {
            return res.status(400).json({
              message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
            });
          }
        }

        const itemTotal = item.price * item.quantity;
        const orderItem: any = {
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          total: itemTotal,
        };

        // Add custom pack data if applicable
        if (item.productId === "3-pack" && item.isCustomPack) {
          orderItem.flavorIds = item.flavorIds;
          orderItem.customPackName = item.customPackName || "Custom 3-Pack";
        }

        orderItemsToCreate.push(orderItem);

        calculatedTotal += itemTotal;
      }
    } else {
      // 3-PACK CART APPROACH - Convert CartLine items to OrderItems

      cartLines = await prisma.cartLine.findMany({
        where: userIdentifier,
        include: {
          packRecipe: {
            include: {
              items: {
                include: {
                  flavor: {
                    include: {
                      inventory: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (cartLines.length === 0) {
        return res
          .status(400)
          .json({ message: "Cart is empty and no order items provided" });
      }

      // Check stock availability for cart lines
      for (const cartLine of cartLines) {
        if (cartLine.packRecipe) {
          // Handle predefined recipes
          for (const item of cartLine.packRecipe.items) {
            const inventory = item.flavor.inventory;
            if (!inventory) {
              return res.status(400).json({
                message: `No inventory found for flavor: ${item.flavor.name}`,
              });
            }

            const required = item.quantity * cartLine.quantity;
            const available =
              inventory.onHand - inventory.reserved - inventory.safetyStock;

            if (available < required) {
              return res.status(400).json({
                message: `Insufficient stock for ${item.flavor.name}. Available: ${available}, Required: ${required}`,
              });
            }
          }
        } else if (cartLine.flavorIds.length > 0) {
          // Handle custom packs
          const flavors = await prisma.flavor.findMany({
            where: { id: { in: cartLine.flavorIds } },
            include: { inventory: true },
          });

          for (const flavor of flavors) {
            const inventory = flavor.inventory;
            if (!inventory) {
              return res.status(400).json({
                message: `No inventory found for flavor: ${flavor.name}`,
              });
            }

            const available =
              inventory.onHand - inventory.reserved - inventory.safetyStock;

            if (available < cartLine.quantity) {
              return res.status(400).json({
                message: `Insufficient stock for ${flavor.name}. Available: ${available}, Required: ${cartLine.quantity}`,
              });
            }
          }
        }
      }

      // Convert cart lines to order items
      orderItemsToCreate = cartLines.map((cartLine) => ({
        productId: cartLine.productId,
        quantity: cartLine.quantity,
        price: cartLine.unitPrice,
        total: cartLine.quantity * cartLine.unitPrice,
      }));

      calculatedTotal = cartLines.reduce(
        (sum, cartLine) => sum + cartLine.quantity * cartLine.unitPrice,
        0
      );

      // Clear the cart after successful order creation
      await prisma.cartLine.deleteMany({
        where: userIdentifier,
      });
    }

    // Use provided total or calculated total
    const finalTotal = requestTotal || calculatedTotal;

    // Create order and order items
    const order = await prisma.order.create({
      data: {
        userId: dbUser?.id ?? undefined,
        guestId: isGuest ? guestId : undefined,
        guestEmail: isGuest ? (guestEmail || shippingAddress?.email) : undefined,
        total: finalTotal,
        shippingAddress,
        orderNotes,
        orderItems: {
          create: orderItemsToCreate,
        },
      },
      include: {
        orderItems: true,
      },
    });

    // Update inventory for all order items
    for (const item of orderItemsToCreate) {
      try {
        // For 3-pack products, we need to deduct from flavor inventory
        if (item.productId === "3-pack") {
          // Get the cart line to find flavor details
          const cartLine = cartLines.find(
            (cl) => cl.productId === item.productId
          );

          if (cartLine?.packRecipe) {
            // Handle predefined recipes
            for (const recipeItem of cartLine.packRecipe.items) {
              await prisma.flavorInventory.update({
                where: { flavorId: recipeItem.flavor.id },
                data: {
                  onHand: {
                    decrement: recipeItem.quantity * item.quantity,
                  },
                  reserved: {
                    decrement: recipeItem.quantity * item.quantity,
                  },
                },
              });
            }
          } else if (cartLine?.flavorIds.length > 0) {
            // Handle custom packs
            for (const flavorId of cartLine.flavorIds) {
              await prisma.flavorInventory.update({
                where: { flavorId },
                data: {
                  onHand: {
                    decrement: item.quantity,
                  },
                  reserved: {
                    decrement: item.quantity,
                  },
                },
              });
            }
          }
        } else {
          // Handle regular products
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }
      } catch (error) {
        console.warn(
          `Could not update inventory for product ${item.productId}:`,
          error
        );
      }
    }

    // SINGLE PRODUCT CART CLEARING - COMMENTED OUT (ONLY USING 3-PACK CART)
    /*
    // Clear user's cart only if we used cart-based approach
    if (!orderItems || orderItems.length === 0) {
      await prisma.cartItem.deleteMany({
        where: { userId: user.id },
      });
    }
    */

    // Create shipment if shipping address is provided
    let shipmentData = null;
    if (shippingAddress && shippingAddress.street && shippingAddress.city && shippingAddress.state && shippingAddress.zipCode) {
      try {
        // Import Shippo service dynamically to avoid circular dependencies
        const { createShipment, getShippingRates } = await import('../services/shippoService');
        
        // Calculate parcel dimensions and weight (default values for licorice)
        const parcels = [{
          length: '6',
          width: '4',
          height: '2',
          weight: '0.5', // 0.5 lbs per order
          massUnit: 'lb' as const,
          distanceUnit: 'in' as const,
        }];

        // Convert shipping address format for Shippo
        const shippoAddress = {
          name: shippingAddress.name || `${user.name || 'Customer'}`,
          company: shippingAddress.company || '',
          email: user.email || '',
          phone: shippingAddress.phone || '',
          street1: shippingAddress.street,
          street2: shippingAddress.street2 || '',
          city: shippingAddress.city,
          state: shippingAddress.state,
          zip: shippingAddress.zipCode,
          country: shippingAddress.country || 'US',
        };

        // Get shipping rates first
        const rates = await getShippingRates(shippoAddress, parcels);
        
        if (rates.length > 0) {
          // Use the first (cheapest) rate for now
          const selectedRate = rates[0];
          
          shipmentData = await createShipment({
            orderId: order.id,
            toAddress: shippoAddress,
            parcels,
          }, selectedRate.objectId, {
            carrier: selectedRate.carrier,
            amount: selectedRate.amount,
            serviceName: selectedRate.serviceName
          });
          
          console.log('📦 Shipment created:', shipmentData);
        }
      } catch (shipmentError) {
        console.error('Shipment creation failed:', shipmentError);
        // Don't fail the order if shipment creation fails
        // The order is still valid, just without shipment tracking
      }
    }

    res.status(201).json({
      message: "Order created successfully",
      order,
      shipment: shipmentData,
    });
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ message: "Error creating order" });
  }
};

// Get user's orders
export const getUserOrders = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { status, page = 1, limit = 10 } = req.query;

    console.log("🔍 Fetching orders for user:", {
      userId: user.id,
      status: status || 'all',
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    });

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = { userId: user.id };
    if (status) {
      where.status = status;
    }

    console.log("📋 Order query where clause:", where);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: "desc" },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    console.log("📊 Order query results:", {
      ordersFound: orders.length,
      totalOrders: total,
      orderIds: orders.map(o => o.id),
      orderDates: orders.map(o => o.createdAt)
    });

    res.json({
      orders,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (err) {
    console.error("❌ Error fetching orders:", err);
    res.status(500).json({ message: "Error fetching orders" });
  }
};

// Get order by ID
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    // Public order tracking - no authentication required
    // Just find the order by ID
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (err) {
    console.error("Error fetching order:", err);
    res.status(500).json({ message: "Error fetching order" });
  }
};

// Update order status (Admin only)
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    // Check if user is admin
    const user = (req as any).user;
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    // Prevent manual payment status changes - only Stripe can update this
    if (paymentStatus !== undefined) {
      return res.status(400).json({ 
        message: "Payment status cannot be changed manually. It is managed automatically by Stripe webhooks." 
      });
    }

    // Only allow order status updates (pending → confirmed → shipped → delivered → cancelled)
    const allowedStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ 
        message: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}` 
      });
    }

    const order = await prisma.order.update({
      where: { id },
      data: {
        status,
        // paymentStatus is intentionally omitted - only Stripe can update this
      },
    });

    res.json({ 
      message: "Order status updated successfully", 
      order,
      note: "Payment status is managed by Stripe and cannot be changed manually"
    });
  } catch (err) {
    console.error("Update order status error:", err);
    res.status(500).json({ message: "Error updating order status" });
  }
};

// Get all orders (Admin only) - Enhanced for high volume
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    // Check if user is admin
    const user = (req as any).user;
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const {
      status,
      paymentStatus,
      page = 1,
      limit = 50,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      dateFilter,
      minTotal,
      maxTotal,
    } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = Math.min(parseInt(limit as string), 200); // Cap at 200 for performance

    // Build where clause
    const where: any = {};

    // Status filters
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;

    // Search functionality - includes guest orders
    if (search && typeof search === "string") {
      const searchTerm = search.trim();
      where.OR = [
        { id: { contains: searchTerm, mode: "insensitive" } },
        { user: { email: { contains: searchTerm, mode: "insensitive" } } },
        { user: { name: { contains: searchTerm, mode: "insensitive" } } },
        { guestEmail: { contains: searchTerm, mode: "insensitive" } },
        { guestId: { contains: searchTerm, mode: "insensitive" } },
      ];
    }

    // Date filters
    if (dateFilter) {
      const now = new Date();
      let startDate: Date;

      switch (dateFilter) {
        case "today":
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          where.createdAt = { gte: startDate };
          break;
        case "yesterday":
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          startDate = new Date(
            yesterday.getFullYear(),
            yesterday.getMonth(),
            yesterday.getDate()
          );
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 1);
          where.createdAt = { gte: startDate, lt: endDate };
          break;
        case "week":
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          weekStart.setHours(0, 0, 0, 0);
          where.createdAt = { gte: weekStart };
          break;
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          where.createdAt = { gte: startDate };
          break;
      }
    }

    // Value range filters
    if (minTotal || maxTotal) {
      where.total = {};
      if (minTotal) where.total.gte = parseFloat(minTotal as string);
      if (maxTotal) where.total.lte = parseFloat(maxTotal as string);
    }

    // Build orderBy
    const orderBy: any = {};
    const validSortFields = ["createdAt", "total", "status", "paymentStatus"];
    const sortField = validSortFields.includes(sortBy as string)
      ? sortBy
      : "createdAt";
    const order = sortOrder === "asc" ? "asc" : "desc";
    orderBy[sortField as string] = order;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          orderItems: {
            select: {
              id: true,
              productId: true,
              quantity: true,
              price: true,
              flavorIds: true,
              customPackName: true,
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      orders,
      pagination: {
        page: parseInt(page as string),
        limit: take,
        total,
        pages: Math.ceil(total / take),
      },
    });
  } catch (err) {
    console.error("Get all orders error:", err);
    res.status(500).json({ message: "Error fetching orders" });
  }
};

// Bulk update orders (Admin only)
export const bulkUpdateOrders = async (req: Request, res: Response) => {
  try {
    // Check if user is admin
    const user = (req as any).user;
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { orderIds, updates } = req.body;

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ message: "Order IDs array is required" });
    }

    if (!updates || typeof updates !== "object") {
      return res.status(400).json({ message: "Updates object is required" });
    }

    // Limit bulk operations to prevent abuse
    if (orderIds.length > 1000) {
      return res.status(400).json({
        message: "Bulk operations are limited to 1000 orders at a time",
      });
    }

    // Validate update fields - only allow order status, not payment status
    const allowedFields = ["status"];
    const updateData: any = {};

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        updateData[key] = value;
      } else if (key === "paymentStatus") {
        // Reject payment status updates
        return res.status(400).json({
          message: "Payment status cannot be changed manually. It is managed automatically by Stripe webhooks.",
        });
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        message: "No valid update fields provided",
      });
    }

    // Perform bulk update
    const result = await prisma.order.updateMany({
      where: {
        id: { in: orderIds },
      },
      data: updateData,
    });

    res.json({
      message: "Bulk update completed successfully",
      updatedCount: result.count,
      requestedCount: orderIds.length,
    });
  } catch (err) {
    console.error("Bulk update orders error:", err);
    res.status(500).json({ message: "Error performing bulk update" });
  }
};

// Bulk delete orders by status
export const bulkDeleteOrders = async (req: Request, res: Response) => {
  try {
    // Check if user is admin
    const user = (req as any).user;
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    // First, get all orders with the specified status
    const ordersToDelete = await prisma.order.findMany({
      where: { status },
      select: { id: true },
    });

    if (ordersToDelete.length === 0) {
      return res.json({
        message: "No orders found with the specified status",
        deletedCount: 0,
      });
    }

    const orderIds = ordersToDelete.map(order => order.id);

    // Delete order items first (foreign key constraint)
    await prisma.orderItem.deleteMany({
      where: {
        orderId: { in: orderIds },
      },
    });

    // Then delete the orders
    const result = await prisma.order.deleteMany({
      where: {
        id: { in: orderIds },
      },
    });

    res.json({
      message: `Successfully deleted ${result.count} orders with status: ${status}`,
      deletedCount: result.count,
    });
  } catch (err) {
    console.error("Bulk delete orders error:", err);
    res.status(500).json({ message: "Error performing bulk delete" });
  }
};
