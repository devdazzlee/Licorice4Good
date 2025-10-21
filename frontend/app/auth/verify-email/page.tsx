"use client";
import React, { useEffect, useState, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/hooks/useUser";

const ORANGE = "#FF5D39";
const YELLOW = "#F1A900";
const WHITE = "#FFFFFF";
const BLACK = "#000000";

function VerifyEmailContent() {
  const { user, refreshUser } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [verifying, setVerifying] = useState(false);
  const [verificationAttempted, setVerificationAttempted] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");

  const email = user?.email || searchParams.get("email") || "";
  const token = searchParams.get("token");

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Check if user is already verified
  useEffect(() => {
    if (user?.isVerified) {
      router.push("/");
    }
  }, [user, router]);

  const handleTokenVerification = useCallback(async (verificationToken: string, userEmail: string) => {
    if (verifying || verificationAttempted) {
      return;
    }

    setVerifying(true);
    setVerificationAttempted(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      
      const response = await fetch(`${API_URL}/auth/verify-email?token=${verificationToken}&email=${encodeURIComponent(userEmail)}`, {
        method: "GET",
        credentials: "include",
      });

      const responseData = await response.json();

      if (response.ok) {
        // Verification successful
        setVerificationMessage("Email verified successfully!");
        
        // Try to refresh user data if logged in, but don't fail if not
        try {
          await refreshUser();
        } catch {
          // User might not be logged in on this device, that's okay
        }
        
        // Redirect to success page
        setTimeout(() => {
          router.push("/auth/verify-success?verified=true");
        }, 1500);
      } else {
        // Check if the error is due to token already being used
        if (responseData.message && responseData.message.includes("already verified")) {
          router.push("/auth/verify-success?verified=true");
        } else if (responseData.message && responseData.message.includes("expired")) {
          // Don't redirect immediately, let user resend
          setVerifying(false);
          setVerificationAttempted(false);
        } else if (responseData.message && responseData.message.includes("Invalid or expired")) {
          router.push("/auth/verify-success?verified=false");
        } else {
          // Other verification failed
          router.push("/auth/verify-success?verified=false");
        }
      }
    } catch {
      router.push("/auth/verify-success?verified=false");
    } finally {
      setVerifying(false);
    }
  }, [router, verifying, verificationAttempted, refreshUser]);

  // Handle token verification if token is present
  useEffect(() => {
    if (token && email) {
      // Add a small delay to prevent race conditions
      const timer = setTimeout(() => {
        handleTokenVerification(token, email);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [token, email, handleTokenVerification]);

  const handleResendVerification = async () => {
    if (countdown > 0) return;
    
    setResendLoading(true);
    setResendSuccess(false);
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${API_URL}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setResendSuccess(true);
        setCountdown(60); // 60 second cooldown
      } else {
        throw new Error("Failed to resend verification email");
      }
    } catch {
      // Handle error silently
    } finally {
      setResendLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    if (verifying) return;
    
    setVerifying(true);
    setVerificationMessage("");
    try {
      // First refresh user data to check current status
      await refreshUser();
      
      // If user is already verified, redirect
      if (user?.isVerified) {
        router.push("/");
        return;
      }
      
      // If we have a token, try to verify it
      if (token && email) {
        await handleTokenVerification(token, email);
      } else {
        // No token available, try to check verification status with backend
        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL;
          const response = await fetch(`${API_URL}/auth/me`, {
            credentials: "include",
          });
          
          if (response.ok) {
            const userData = await response.json();
            if (userData.user?.isVerified) {
              router.push("/");
            } else {
              setVerificationMessage("Please check your email and click the verification link, or request a new verification email.");
            }
          } else {
            setVerificationMessage("Unable to check verification status. Please try again or request a new verification email.");
          }
        } catch {
          setVerificationMessage("Unable to check verification status. Please try again or request a new verification email.");
        }
      }
    } catch {
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 rounded-full mb-4 flex items-center justify-center" style={{ background: `${ORANGE}10` }}>
            {verifying ? (
              <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: ORANGE }}></div>
            ) : (
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke={ORANGE}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            )}
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: BLACK }}>
            {verifying ? "Verifying..." : "Check Your Email"}
          </h1>
          <p className="text-gray-600 mb-4">
            {verifying ? "Please wait while we verify your email..." : `We've sent a verification link to`}
          </p>
          <p className="font-semibold mb-4" style={{ color: ORANGE }}>{email}</p>
          {!verifying && !user && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">
                <strong>💡 Cross-Device Verification:</strong> You can verify your email from any device! If you&apos;re logged in on another device, the verification will work there too.
              </p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <h3 className="font-semibold mb-3" style={{ color: BLACK }}>Next Steps:</h3>
          <ol className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-semibold flex items-center justify-center mr-3 mt-0.5">1</span>
              Check your email inbox (and spam folder)
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-semibold flex items-center justify-center mr-3 mt-0.5">2</span>
              Click the verification link in the email
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-semibold flex items-center justify-center mr-3 mt-0.5">3</span>
              Return here and click &ldquo;I&#39;ve Verified My Email&ldquo;
            </li>
          </ol>
          
          {/* Email Protection Notice */}
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              <strong>Note:</strong> If you see an &quot;expired&ldquo; error, your email provider may have automatically clicked the link. 
              Try clicking &quot;Resend Verification Email&quot; to get a fresh link.
            </p>
          </div>
        </div>

        {/* Verification Message */}
        {verificationMessage && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">{verificationMessage}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleCheckVerification}
            disabled={verifying}
            className="w-full font-semibold py-3 rounded-xl text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: `linear-gradient(90deg, ${ORANGE}, ${YELLOW})` }}
          >
            {verifying ? "Verifying..." : "I've Verified My Email"}
          </button>

          <button
            onClick={handleResendVerification}
            disabled={resendLoading || countdown > 0 || verifying}
            className="w-full font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              border: `2px solid ${ORANGE}`,
              color: ORANGE,
              background: WHITE,
            }}
          >
            {resendLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 mr-2" style={{ borderColor: ORANGE }}></div>
                Sending...
              </div>
            ) : countdown > 0 ? (
              `Resend in ${countdown}s`
            ) : (
              "Resend Verification Email"
            )}
          </button>

          {resendSuccess && (
            <div className="text-center p-3 rounded-lg" style={{ background: `${YELLOW}10` }}>
              <p className="text-sm font-medium" style={{ color: YELLOW }}>
                ✅ Verification email sent! Check your inbox.
              </p>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-2">Didn&apos;t receive the email?</p>
          <div className="text-xs text-gray-400 space-y-1">
            <p>• Check your spam/junk folder</p>
            <p>• Make sure {email} is correct</p>
            <p>• Wait a few minutes for delivery</p>
          </div>
        </div>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          {!user ? (
            <div className="space-y-3">
              <button
                onClick={() => router.push("/auth/login")}
                className="w-full font-semibold py-3 rounded-xl transition-all duration-200"
                style={{
                  background: ORANGE,
                  color: WHITE,
                }}
              >
                Log In (Optional)
              </button>
              <p className="text-xs text-gray-500">
                You can verify your email without logging in, or log in to access your account
              </p>
            </div>
          ) : (
            <button
              onClick={() => router.push("/auth/login")}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Back to Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: ORANGE }}></div>
          <p style={{ color: BLACK, opacity: 0.7 }}>Loading...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
