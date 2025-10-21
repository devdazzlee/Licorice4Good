import express from "express";
import {
  addToCart,
  getUserCart,
  updateCartLine,
  removeCartLine,
  clearCart,
} from "../controller/threePackCartController";
import { optionalAuth } from "../middlewares/auth.middleware";

const router = express.Router();

// Cart routes support both authenticated and guest users
router.use(optionalAuth);

// 3-Pack Cart operations
router.post("/add", addToCart); // Add 3-pack to cart
router.get("/", getUserCart); // Get user's 3-pack cart
router.put("/:id", updateCartLine); // Update cart line quantity
router.delete("/:id", removeCartLine); // Remove cart line
router.delete("/", clearCart); // Clear entire cart

export default router;
