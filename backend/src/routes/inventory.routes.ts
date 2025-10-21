import express from "express";
import {
  getAllInventory,
  getFlavorInventory,
  updateInventory,
  bulkUpdateInventory,
  getLowStockAlerts,
} from "../controller/inventoryController";
import { protect } from "../middlewares/auth.middleware";
import { adminOnly } from "../middlewares/admin.middleware";

const router = express.Router();

// All inventory routes require authentication
router.use(protect);

// Public inventory routes (authenticated users can view)
router.get("/", getAllInventory); // Get all inventory
router.get("/alerts", getLowStockAlerts); // Get low stock alerts
router.get("/:flavorId", getFlavorInventory); // Get specific flavor inventory

// Admin-only inventory routes
router.put("/:flavorId", adminOnly, updateInventory); // Update specific flavor inventory
router.put("/bulk", adminOnly, bulkUpdateInventory); // Bulk update inventory

export default router;
