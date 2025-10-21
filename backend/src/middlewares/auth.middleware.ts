import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

interface DecodedToken {
  id: string;
  role?: string;
}

// Required authentication - returns 401 if not authenticated
export const protect = (req: Request, res: Response, next: NextFunction) => {
  let token;
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      message:
        "Authentication required. Please log in to access this resource.",
      code: "NO_TOKEN",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
    (req as any).user = { id: decoded.id, role: decoded.role };
    (req as any).isGuest = false;
    
    // Debug logging for order-related and payment-related requests
    if (req.path.includes('/orders') || req.path.includes('/payments')) {
      console.log("🔐 Auth middleware - User authenticated:", {
        userId: decoded.id,
        role: decoded.role,
        path: req.path,
        method: req.method
      });
    }
    
    next();
  } catch {
    // Token is invalid or expired
    res.status(401).json({
      message: "Invalid or expired authentication token. Please log in again.",
      code: "INVALID_TOKEN",
    });
  }
};

// Optional authentication - allows guest users to proceed
// Creates a guest session ID if user is not authenticated
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  let token;
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    // No token - treat as guest user
    // Get or create guest session ID
    let guestId = req.cookies?.guestId;
    if (!guestId) {
      guestId = `guest_${uuidv4()}`;
      // Set guest ID cookie (expires in 30 days)
      res.cookie("guestId", guestId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });
    }
    
    (req as any).guestId = guestId;
    (req as any).isGuest = true;
    (req as any).user = null;
    
    console.log("👤 Guest user accessing:", {
      guestId,
      path: req.path,
      method: req.method
    });
    
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
    (req as any).user = { id: decoded.id, role: decoded.role };
    (req as any).isGuest = false;
    (req as any).guestId = null;
    
    // Debug logging for order-related and payment-related requests
    if (req.path.includes('/orders') || req.path.includes('/payments')) {
      console.log("🔐 Authenticated user accessing:", {
        userId: decoded.id,
        role: decoded.role,
        path: req.path,
        method: req.method
      });
    }
    
    next();
  } catch {
    // Token is invalid - treat as guest
    let guestId = req.cookies?.guestId;
    if (!guestId) {
      guestId = `guest_${uuidv4()}`;
      res.cookie("guestId", guestId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });
    }
    
    (req as any).guestId = guestId;
    (req as any).isGuest = true;
    (req as any).user = null;
    
    next();
  }
};
