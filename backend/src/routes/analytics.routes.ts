import express from "express";
import {
  getDashboardAnalytics,
  getRealTimeMetrics,
  getVerificationInsights,
} from "../controller/analyticsController";
import { protect } from "../middlewares/auth.middleware";
import { adminOnly } from "../middlewares/admin.middleware";

const router = express.Router();

// All analytics routes require authentication and admin role
router.use(protect);
router.use(adminOnly);

// Analytics routes
router.get("/dashboard", getDashboardAnalytics);
router.get("/real-time", getRealTimeMetrics);
router.get("/verification", getVerificationInsights);

export default router;
