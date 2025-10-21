import crypto from "crypto";
import { prisma } from "../config/database";
import { sendVerificationEmail } from "./mailer";

export interface VerificationTokenData {
  userId: string;
  email: string;
  type: "email_verification" | "password_reset";
}

/**
 * Generate a secure verification token
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Generate a 6-digit verification code
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Hash a token for secure storage
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Create verification token and send email
 */
export async function createVerificationToken(
  userId: string,
  email: string,
  type: "email_verification" | "password_reset" = "email_verification"
): Promise<{ token: string; code: string }> {
  const token = generateVerificationToken();
  const code = generateVerificationCode();
  const hashedToken = hashToken(token);

  // Set expiry to 24 hours from now
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // Store in database
  await prisma.user.update({
    where: { id: userId },
    data: {
      verificationTokenHash: hashedToken,
      verificationTokenExpiry: expiresAt,
    },
  });

  // Send verification email
  if (type === "email_verification") {
    await sendVerificationEmail(email, token, code);
  }

  return { token, code };
}

/**
 * Verify email verification token
 */
export async function verifyEmailToken(
  token: string,
  email: string
): Promise<{ success: boolean; user?: any; message: string }> {
  try {
    if (!email) {
      return {
        success: false,
        message: "Email is required for verification",
      };
    }

    const hashedToken = hashToken(token);

    const user = await prisma.user.findFirst({
      where: {
        verificationTokenHash: hashedToken,
        verificationTokenExpiry: {
          gt: new Date(),
        },
        email: email, // Email is now required and must match
      },
    });

    if (!user) {
      return {
        success: false,
        message: "Invalid or expired verification token for this email address",
      };
    }

    // Mark user as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationTokenHash: null,
        verificationTokenExpiry: null,
      },
    });

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isVerified: true,
      },
      message: "Email verified successfully",
    };
  } catch (error) {
    console.error("Error verifying email token:", error);
    return {
      success: false,
      message: "Error verifying email",
    };
  }
}

/**
 * Resend verification email
 */
export async function resendVerificationEmail(
  email: string
): Promise<{ success: boolean; message: string }> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    if (user.isVerified) {
      return {
        success: false,
        message: "Email is already verified",
      };
    }

    // Create new verification token
    const { token, code } = await createVerificationToken(user.id, email);

    return {
      success: true,
      message: "Verification email sent successfully",
    };
  } catch (error) {
    console.error("Error resending verification email:", error);
    return {
      success: false,
      message: "Error sending verification email",
    };
  }
}

/**
 * Check if user is verified
 */
export async function isUserVerified(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isVerified: true },
  });

  return user?.isVerified || false;
}
