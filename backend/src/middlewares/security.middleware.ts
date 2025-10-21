import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { logger } from "../utils/logger";

// Rate limiting
export const createRateLimit = (
  windowMs: number,
  max: number,
  message?: string
) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error:
        message || "Too many requests from this IP, please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      logger.warn({
        message: "Rate limit exceeded",
        ip: req.ip,
        url: req.url,
        method: req.method,
      });
      res.status(429).json({
        error:
          message || "Too many requests from this IP, please try again later.",
      });
    },
  });
};

// General rate limit
export const generalRateLimit = createRateLimit(
  parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes
  parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "500"), // 500 requests per window (increased from 100)
  "Too many requests from this IP, please try again later."
);

// Strict rate limit for auth endpoints (login, register, etc.) - COMMENTED OUT FOR NOW
// export const authRateLimit = createRateLimit(
//   15 * 60 * 1000, // 15 minutes
//   10, // 10 attempts per window (increased from 5)
//   'Too many authentication attempts, please try again later.'
// );

// More lenient rate limit for /me endpoint
export const meRateLimit = createRateLimit(
  5 * 60 * 1000, // 5 minutes
  100, // 100 requests per 5 minutes (increased from 20)
  "Too many requests to user profile, please try again later."
);

// Helmet configuration
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: [
        "'self'",
        "data:",
        "https:",
        "http:",
        "http://localhost:*",
        "https://licorice4good.com",
        "*",
      ],
      connectSrc: ["'self'", "http://localhost:*", "https://licorice4good.com"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

// Input validation middleware
export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn({
      message: "Validation failed",
      errors: errors.array(),
      url: req.url,
      method: req.method,
    });
    return res.status(400).json({
      error: "Validation failed",
      details: errors.array(),
    });
  }
  next();
};

// Common validation rules
export const validateEmail = body("email")
  .isEmail()
  .normalizeEmail()
  .withMessage("Please provide a valid email address");

export const validatePassword = body("password")
  .isLength({ min: 6 })
  .withMessage("Password must be at least 6 characters long")
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .withMessage(
    "Password must contain at least one uppercase letter, one lowercase letter, and one number"
  );

export const validateName = body("name")
  .trim()
  .isLength({ min: 2, max: 50 })
  .withMessage("Name must be between 2 and 50 characters");

// Security headers middleware
export const securityHeaders = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Remove X-Powered-By header
  res.removeHeader("X-Powered-By");

  // Add security headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  next();
};

// Request logging middleware
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    });
  });

  next();
};
