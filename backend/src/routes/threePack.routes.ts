import express from "express";
import {
  getThreePackProduct,
  getInventoryAvailability,
  getAllFlavors,
  getAllPackRecipes,
  createFlavor,
  updateFlavor,
  deleteFlavor,
} from "../controller/threePackController";
import { protect } from "../middlewares/auth.middleware";
import { adminOnly } from "../middlewares/admin.middleware";

const router = express.Router();

// Public routes
router.get("/product", getThreePackProduct); // Get 3-pack product with variants
router.get("/flavors", getAllFlavors); // Get all flavors (public)
router.get("/inventory/availability", getInventoryAvailability); // Check inventory availability

// Admin routes (authentication + admin role required)
router.use(protect);
router.get("/admin/flavors", adminOnly, getAllFlavors); // Get all flavors for admin
router.post("/admin/flavors", adminOnly, createFlavor); // Create new flavor
router.patch("/admin/flavors/:id", adminOnly, updateFlavor); // Update flavor
router.delete("/admin/flavors/:id", adminOnly, deleteFlavor); // Delete flavor
router.get("/admin/recipes", adminOnly, getAllPackRecipes); // Get all pack recipes for admin

export default router;
