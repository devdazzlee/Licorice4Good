import express from "express";
import {
  createProduct,
  getAllProducts,
  getAllProductsForAdmin,
  getProductById,
  updateProduct,
  deleteProduct,
  getCategories,
  getAllFlavors,
} from "../controller/productController";
import { protect } from "../middlewares/auth.middleware";
import { adminOnly } from "../middlewares/admin.middleware";
import {
  uploadProductImage,
  handleUploadError,
} from "../middlewares/upload.middleware";

const router = express.Router();

// Public routes (no authentication required)
router.get("/", getAllProducts); // Get all products
router.get("/categories", getCategories); // Get all product categories
router.get("/flavors", getAllFlavors); // Get all flavors (public for product management)
router.get("/:id", getProductById); // Get product by ID

// Admin routes (authentication + admin role required)
router.use(protect);
router.get("/admin/all", adminOnly, getAllProductsForAdmin); // Get all products for admin (including inactive)
router.post(
  "/admin/products",
  adminOnly,
  uploadProductImage,
  handleUploadError,
  createProduct
); // Create a new product
router.put("/admin/:id", adminOnly, uploadProductImage, handleUploadError, updateProduct); // Update a product
router.delete("/admin/:id", adminOnly, deleteProduct); // Delete a product

export default router;
