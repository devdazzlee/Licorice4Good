import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../config/database";
import { generateToken } from "../utils/jwt";
import crypto from "crypto";
import { sendResetEmail } from "../utils/mailer";
import { logger } from "../utils/logger";
import { 
  createVerificationToken, 
  verifyEmailToken, 
  resendVerificationEmail,
  isUserVerified 
} from "../utils/emailVerification";

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  try {
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: "user",
        provider: "local",
        providerId: `local_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        isVerified: false, // User starts unverified
      },
    });

    // Create verification token and send email
    try {
      await createVerificationToken(newUser.id, newUser.email!);
      logger.info(`Verification email sent to ${newUser.email}`);
    } catch (emailError) {
      logger.error("Error sending verification email:", emailError);
      // Don't fail registration if email fails
    }

    const token = generateToken(String(newUser.id), newUser.role);

    // Determine cookie domain based on environment and request origin
    let cookieDomain = undefined;
    if (process.env.NODE_ENV === "production") {
      // Use leading dot to make cookie work across all subdomains
      cookieDomain = ".licorice4good.com";
    } else if (req.headers.origin?.includes('localhost')) {
      // For local development, don't set domain to allow localhost access
      cookieDomain = undefined;
    }

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        domain: cookieDomain,
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(201)
      .json({ 
        message: "Registration successful. Please check your email to verify your account.",
        user: { ...newUser, password: undefined },
        token: token,
        requiresVerification: true
      });
  } catch (err) {
    logger.error("Registration error:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  console.log("Login request:", { email, password });
  try {
    const user = await prisma.user.findUnique({ 
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        isVerified: true
      }
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if user is verified - only block if not verified
    if (!user.isVerified) {
      return res.status(403).json({ 
        message: "Please verify your email address before logging in",
        requiresVerification: true,
        email: user.email
      });
    }

    const token = generateToken(String(user.id), user.role);
    // Determine cookie domain based on environment and request origin
    let cookieDomain = undefined;
    if (process.env.NODE_ENV === "production") {
      // Use leading dot to make cookie work across all subdomains
      cookieDomain = ".licorice4good.com";
    } else if (req.headers.origin?.includes('localhost')) {
      // For local development, don't set domain to allow localhost access
      cookieDomain = undefined;
    }

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        domain: cookieDomain,
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        user: { ...user, password: undefined },
        token: token,
      });
  } catch (err) {
    logger.error("Login error:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const resetTokenExpiry = new Date(Date.now() + 600000); // 10 minutes

    await prisma.user.update({
      where: { email },
      data: {
        resetToken: code,
        resetTokenExpiry,
      },
    });

    await sendResetEmail(email, code);
    res.status(200).json({ message: "Reset code sent to your email" });
  } catch (err) {
    res.status(500).json({ message: "Error sending email", error: err });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  // Accept both "newPassword" (backend contract) and "password" (frontend alias)
  const { code, newPassword, password } = req.body as {
    code?: string;
    newPassword?: string;
    password?: string;
  };
  const nextPassword = newPassword || password;
  try {
    if (!code || !nextPassword) {
      return res
        .status(400)
        .json({ message: "Reset code and new password are required" });
    }
    const user = await prisma.user.findFirst({
      where: {
        resetToken: code,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired code" });

    const hashed = await bcrypt.hash(nextPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Error resetting password:", err);
    res.status(500).json({ message: "Error resetting password" });
  }
};

export const logout = (req: Request, res: Response) => {
  // Determine cookie domain based on environment and request origin
  let cookieDomain = undefined;
  if (process.env.NODE_ENV === "production") {
    // Use leading dot to make cookie work across all subdomains
    cookieDomain = ".licorice4good.com";
  } else if (req.headers.origin?.includes('localhost')) {
    // For local development, don't set domain to allow localhost access
    cookieDomain = undefined;
  }

  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    domain: cookieDomain,
    path: "/",
  });
  res.status(200).json({ message: "Logged out successfully", user: null });
};

export const me = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        provider: true,
        role: true,
        isVerified: true,
      },
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { name, phone } = req.body;

    // Validate input
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: "Name is required" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name.trim(),
        ...(phone && { phone: phone.trim() }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        provider: true,
        role: true,
      },
    });

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    logger.error("Error updating profile:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Email Verification Endpoints

export const verifyEmail = async (req: Request, res: Response) => {
  // Support both query params (GET) and body params (POST)
  const { token, email } = req.method === 'GET' ? req.query : req.body;
  
  try {
    if (!token || !email) {
      return res.status(400).json({ 
        message: "Verification token and email are required" 
      });
    }

    const result = await verifyEmailToken(token as string, email as string);
    
    if (!result.success) {
      return res.status(400).json({ 
        message: result.message,
        verified: false
      });
    }

    res.status(200).json({
      message: result.message,
      verified: true,
      user: result.user
    });
  } catch (err) {
    logger.error("Email verification error:", err);
    res.status(500).json({ 
      message: "Error verifying email",
      verified: false
    });
  }
};

export const resendVerification = async (req: Request, res: Response) => {
  const { email } = req.body;
  
  try {
    if (!email) {
      return res.status(400).json({ 
        message: "Email is required" 
      });
    }

    const result = await resendVerificationEmail(email);
    
    if (!result.success) {
      return res.status(400).json({ 
        message: result.message 
      });
    }

    res.status(200).json({
      message: result.message
    });
  } catch (err) {
    logger.error("Resend verification error:", err);
    res.status(500).json({ 
      message: "Error resending verification email" 
    });
  }
};

export const checkVerificationStatus = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const isVerified = await isUserVerified(userId);
    
    res.status(200).json({
      isVerified,
      message: isVerified ? "Email is verified" : "Email is not verified"
    });
  } catch (err) {
    logger.error("Check verification status error:", err);
    res.status(500).json({ 
      message: "Error checking verification status" 
    });
  }
};
