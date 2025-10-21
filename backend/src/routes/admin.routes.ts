import express from "express";
import {
  getAllFlavors,
  createFlavor,
  updateFlavor,
  deleteFlavor,
  bulkUpdateFlavorImages,
  cleanupOrphanedImages,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  updateFlavorInventory,
  getInventoryAlerts,
  getSystemConfig,
} from "../controller/adminController";
import { protect } from "../middlewares/auth.middleware";
import { adminOnly } from "../middlewares/admin.middleware";
import {
  uploadFlavorImage,
  handleUploadError,
} from "../middlewares/upload.middleware";

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(adminOnly);

// ==================== FLAVOR MANAGEMENT ====================
router.get("/flavors", getAllFlavors);
router.post("/flavors", uploadFlavorImage, handleUploadError, createFlavor);
router.put("/flavors/:id", uploadFlavorImage, handleUploadError, updateFlavor);
router.delete("/flavors/:id", deleteFlavor);
router.put("/flavors/bulk-update-images", bulkUpdateFlavorImages);
router.post("/flavors/cleanup-images", cleanupOrphanedImages);

// ==================== CATEGORY MANAGEMENT ====================
router.get("/categories", getAllCategories);
router.post("/categories", createCategory);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);

// ==================== INVENTORY MANAGEMENT ====================
router.put("/inventory/:id", updateFlavorInventory);
router.get("/inventory/alerts", getInventoryAlerts);

// ==================== SYSTEM CONFIGURATION ====================
router.get("/config", getSystemConfig);

export default router;
