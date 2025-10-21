import express from "express";
import {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
  bulkUpdateOrders,
  bulkDeleteOrders,
} from "../controller/orderController";
import { protect, optionalAuth } from "../middlewares/auth.middleware";
import { adminOnly } from "../middlewares/admin.middleware";

const router = express.Router();

// Create order supports guest checkout
router.post("/", optionalAuth, createOrder);

// Get user's orders (requires authentication)
router.get("/", protect, getUserOrders);

// Track order by ID (public - no authentication required)
router.get("/:id", getOrderById);

// Admin routes (admin role required)
router.put("/:id/status", protect, adminOnly, updateOrderStatus);
router.get("/admin/all", protect, adminOnly, getAllOrders);
router.put("/admin/bulk-update", protect, adminOnly, bulkUpdateOrders);
router.delete("/admin/bulk-delete", protect, adminOnly, bulkDeleteOrders);

export default router;
