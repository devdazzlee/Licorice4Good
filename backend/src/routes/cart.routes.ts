// SINGLE PRODUCT CART ROUTES - COMMENTED OUT (ONLY USING 3-PACK CART)
/*
import express from "express";
import {
  addToCart,
  getUserCart,
  deleteUserCart,
  updateCartItem,
  clearUserCart,
} from "../controller/cartController";
import { protect } from "../middlewares/auth.middleware";
import {
  uploadMultipleImages,
  handleUploadError,
} from "../middlewares/upload.middleware";

const router = express.Router();

// All cart routes require authentication
router.use(protect);

// Cart CRUD operations
router.post("/add", uploadMultipleImages, handleUploadError, addToCart);
router.get("/cart", getUserCart);
router.delete("/:id", deleteUserCart);
router.put("/:id", updateCartItem);
router.delete("/", clearUserCart);

export default router;
*/
