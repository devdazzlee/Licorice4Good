import express from "express";
import {
  register,
  login,
  forgotPassword,
  resetPassword,
  logout,
  me,
  updateProfile,
  verifyEmail,
  resendVerification,
  checkVerificationStatus,
} from "../controller/authController";
import { protect } from "../middlewares/auth.middleware";
import { 
  validateEmail, 
  validatePassword, 
  validateName, 
  validateRequest,
  meRateLimit
} from "../middlewares/security.middleware";
import { body } from "express-validator";

const router = express.Router();

// Register route with validation
router.post("/register", [
  validateName,
  validateEmail,
  validatePassword,
  validateRequest
], register);

// Login route with validation
router.post("/login", [
  validateEmail,
  body('password').notEmpty().withMessage('Password is required'),
  validateRequest
], login);

// Forgot password route with validation
router.post("/forgot-password", [
  validateEmail,
  validateRequest
], forgotPassword);

// Reset password route with validation
router.post("/reset-password", [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('code').isLength({ min: 6, max: 6 }).withMessage('Code must be 6 digits'),
  validatePassword,
  validateRequest
], resetPassword);

router.post("/logout", logout);

// Email verification routes
router.get("/verify-email", verifyEmail);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", [
  validateEmail,
  validateRequest
], resendVerification);
router.get("/verification-status", protect, checkVerificationStatus);

// Protected routes
router.get("/me", meRateLimit, protect, me);
router.put("/profile", protect, [
  validateName,
  validateRequest
], updateProfile);

export default router;
