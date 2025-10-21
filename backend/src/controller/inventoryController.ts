import { Request, Response } from "express";
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

// Get all flavor inventory
export const getAllInventory = async (req: Request, res: Response) => {
  try {
    const inventory = await prisma.flavorInventory.findMany({
      include: {
        flavor: true,
      },
      orderBy: {
        flavor: {
          name: "asc",
        },
      },
    });

    const inventoryWithAvailability = inventory.map((inv) => ({
      id: inv.id,
      flavor_id: inv.flavorId,
      flavor_name: inv.flavor.name,
      on_hand: inv.onHand,
      reserved: inv.reserved,
      safety_stock: inv.safetyStock,
      available: inv.onHand - inv.reserved,
      available_after_safety: inv.onHand - inv.reserved - inv.safetyStock,
      last_updated: inv.updatedAt,
    }));

    res.json(inventoryWithAvailability);
  } catch (error) {
    console.error("Error fetching inventory:", error);
    res.status(500).json({ message: "Error fetching inventory" });
  }
};

// Get inventory for a specific flavor
export const getFlavorInventory = async (req: Request, res: Response) => {
  try {
    const { flavorId } = req.params;

    const inventory = await prisma.flavorInventory.findUnique({
      where: { flavorId },
      include: {
        flavor: true,
      },
    });

    if (!inventory) {
      return res.status(404).json({ message: "Flavor inventory not found" });
    }

    const inventoryWithAvailability = {
      id: inventory.id,
      flavor_id: inventory.flavorId,
      flavor_name: inventory.flavor.name,
      on_hand: inventory.onHand,
      reserved: inventory.reserved,
      safety_stock: inventory.safetyStock,
      available: inventory.onHand - inventory.reserved,
      available_after_safety:
        inventory.onHand - inventory.reserved - inventory.safetyStock,
      last_updated: inventory.updatedAt,
    };

    res.json(inventoryWithAvailability);
  } catch (error) {
    console.error("Error fetching flavor inventory:", error);
    res.status(500).json({ message: "Error fetching flavor inventory" });
  }
};

// Update inventory (Admin only)
export const updateInventory = async (req: Request, res: Response) => {
  try {
    const { flavorId } = req.params;
    const { on_hand, safety_stock } = req.body;

    if (on_hand !== undefined && (typeof on_hand !== "number" || on_hand < 0)) {
      return res.status(400).json({
        message: "on_hand must be a non-negative number",
      });
    }

    if (
      safety_stock !== undefined &&
      (typeof safety_stock !== "number" || safety_stock < 0)
    ) {
      return res.status(400).json({
        message: "safety_stock must be a non-negative number",
      });
    }

    const updateData: any = {};
    if (on_hand !== undefined) updateData.onHand = on_hand;
    if (safety_stock !== undefined) updateData.safetyStock = safety_stock;

    const updatedInventory = await prisma.flavorInventory.update({
      where: { flavorId },
      data: updateData,
      include: {
        flavor: true,
      },
    });

    const inventoryWithAvailability = {
      id: updatedInventory.id,
      flavor_id: updatedInventory.flavorId,
      flavor_name: updatedInventory.flavor.name,
      on_hand: updatedInventory.onHand,
      reserved: updatedInventory.reserved,
      safety_stock: updatedInventory.safetyStock,
      available: updatedInventory.onHand - updatedInventory.reserved,
      available_after_safety:
        updatedInventory.onHand -
        updatedInventory.reserved -
        updatedInventory.safetyStock,
      last_updated: updatedInventory.updatedAt,
    };

    res.json({
      message: "Inventory updated successfully",
      inventory: inventoryWithAvailability,
    });
  } catch (error) {
    console.error("Error updating inventory:", error);
    res.status(500).json({ message: "Error updating inventory" });
  }
};

// Bulk update inventory (Admin only)
export const bulkUpdateInventory = async (req: Request, res: Response) => {
  try {
    const { updates } = req.body;

    if (!Array.isArray(updates)) {
      return res.status(400).json({
        message: "updates must be an array",
      });
    }

    const results = [];

    for (const update of updates) {
      const { flavor_id, on_hand, safety_stock } = update;

      if (!flavor_id) {
        results.push({
          flavor_id: "unknown",
          success: false,
          error: "flavor_id is required",
        });
        continue;
      }

      try {
        const updateData: any = {};
        if (on_hand !== undefined) {
          if (typeof on_hand !== "number" || on_hand < 0) {
            results.push({
              flavor_id,
              success: false,
              error: "on_hand must be a non-negative number",
            });
            continue;
          }
          updateData.onHand = on_hand;
        }

        if (safety_stock !== undefined) {
          if (typeof safety_stock !== "number" || safety_stock < 0) {
            results.push({
              flavor_id,
              success: false,
              error: "safety_stock must be a non-negative number",
            });
            continue;
          }
          updateData.safetyStock = safety_stock;
        }

        const updatedInventory = await prisma.flavorInventory.update({
          where: { flavorId: flavor_id },
          data: updateData,
          include: {
            flavor: true,
          },
        });

        results.push({
          flavor_id,
          success: true,
          inventory: {
            id: updatedInventory.id,
            flavor_id: updatedInventory.flavorId,
            flavor_name: updatedInventory.flavor.name,
            on_hand: updatedInventory.onHand,
            reserved: updatedInventory.reserved,
            safety_stock: updatedInventory.safetyStock,
            available: updatedInventory.onHand - updatedInventory.reserved,
            available_after_safety:
              updatedInventory.onHand -
              updatedInventory.reserved -
              updatedInventory.safetyStock,
          },
        });
      } catch (error) {
        results.push({
          flavor_id,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    res.json({
      message: `Bulk update completed: ${successCount} successful, ${failureCount} failed`,
      results,
    });
  } catch (error) {
    console.error("Error bulk updating inventory:", error);
    res.status(500).json({ message: "Error bulk updating inventory" });
  }
};

// Get low stock alerts
export const getLowStockAlerts = async (req: Request, res: Response) => {
  try {
    const { threshold } = req.query;
    const alertThreshold = threshold ? parseInt(threshold as string) : 10;

    const inventory = await prisma.flavorInventory.findMany({
      include: {
        flavor: true,
      },
      where: {
        OR: [
          {
            onHand: {
              lte: alertThreshold,
            },
          },
          {
            reserved: {
              gte: prisma.flavorInventory.fields.onHand,
            },
          },
        ],
      },
      orderBy: {
        onHand: "asc",
      },
    });

    const alerts = inventory.map((inv) => {
      const available = inv.onHand - inv.reserved;
      const availableAfterSafety = available - inv.safetyStock;

      return {
        flavor_id: inv.flavorId,
        flavor_name: inv.flavor.name,
        on_hand: inv.onHand,
        reserved: inv.reserved,
        safety_stock: inv.safetyStock,
        available,
        available_after_safety: availableAfterSafety,
        alert_type:
          availableAfterSafety <= 0
            ? "out_of_stock"
            : availableAfterSafety <= alertThreshold
            ? "low_stock"
            : "normal",
        severity:
          availableAfterSafety <= 0
            ? "critical"
            : availableAfterSafety <= alertThreshold
            ? "warning"
            : "info",
      };
    });

    res.json({
      threshold: alertThreshold,
      total_alerts: alerts.length,
      critical_alerts: alerts.filter((a) => a.severity === "critical").length,
      warning_alerts: alerts.filter((a) => a.severity === "warning").length,
      alerts,
    });
  } catch (error) {
    console.error("Error fetching low stock alerts:", error);
    res.status(500).json({ message: "Error fetching low stock alerts" });
  }
};
