"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/hooks/useUser";

const ORANGE = "#FF5D39";
const YELLOW = "#F1A900";
const WHITE = "#FFFFFF";
const BLACK = "#000000";

function VerifySuccessContent() {
  const { user, refreshUser } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(5);
  const [verificationStatus, setVerificationStatus] = useState<'checking' | 'success' | 'error'>('checking');

  const email = searchParams.get("email");

  // Countdown timer for redirect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (verificationStatus === 'success') {
      router.push("/");
    }
  }, [countdown, verificationStatus, router]);

  // Check verification status when component mounts
  useEffect(() => {
    const checkVerificationStatus = async () => {
      // Check if we have a verified parameter from the URL
      const verifiedParam = searchParams.get("verified");
      
      if (verifiedParam === "true") {
        setVerificationStatus('success');
        // Try to refresh user data if logged in, but don't fail if not
        try {
          await refreshUser();
        } catch {
          // User might not be logged in on this device, that's okay
        }
        // Force a small delay to ensure user data is updated
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else if (verifiedParam === "false") {
        setVerificationStatus('error');
      } else {
        // If no verified parameter, check user status
        try {
          await refreshUser();
          // The verification status will be determined by the user's isVerified status
          setVerificationStatus('checking');
        } catch {
          setVerificationStatus('error');
        }
      }
    };

    checkVerificationStatus();
  }, [searchParams, refreshUser]);

  // Check user verification status when user data changes
  useEffect(() => {
    if (user && verificationStatus === 'checking') {
      if (user.isVerified) {
        setVerificationStatus('success');
      } else {
        setVerificationStatus('error');
      }
    }
  }, [user, verificationStatus]);

  const handleContinue = () => {
    router.push("/");
  };

  const handleRetry = () => {
    router.push("/auth/verify-email" + (email ? `?email=${encodeURIComponent(email)}` : ""));
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        {/* Header */}
        <div className="mb-8">
          {verificationStatus === 'checking' && (
            <>
              <div className="mx-auto w-20 h-20 rounded-full mb-4 flex items-center justify-center" style={{ background: `${YELLOW}10` }}>
                <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: YELLOW }}></div>
              </div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: BLACK }}>Verifying Email...</h1>
              <p className="text-gray-600">
                Please wait while we verify your email address
              </p>
            </>
          )}

          {verificationStatus === 'success' && (
            <>
              <div className="mx-auto w-20 h-20 rounded-full mb-4 flex items-center justify-center" style={{ background: `${ORANGE}10` }}>
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke={ORANGE}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M12 22a10 10 0 110-20 10 10 0 010 20z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: BLACK }}>Email Verified!</h1>
              <p className="text-gray-600 mb-4">
                Your email has been successfully verified. You can now access all features.
              </p>
              <p className="text-sm text-gray-500">
                Redirecting to home page in {countdown} seconds...
              </p>
            </>
          )}

          {verificationStatus === 'error' && (
            <>
              <div className="mx-auto w-20 h-20 rounded-full mb-4 flex items-center justify-center" style={{ background: `${ORANGE}10` }}>
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke={ORANGE}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: BLACK }}>Verification Failed</h1>
              <p className="text-gray-600">
                We couldn&apos;t verify your email. The link may be expired or invalid.
              </p>
            </>
          )}
        </div>

        {/* Status-specific content */}
        {verificationStatus === 'success' && (
          <div className="space-y-4">
            <div className="bg-green-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-green-800">
                ✅ Your account is now fully activated. You can access all features including cart, orders, and profile.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleContinue}
                className="w-full font-semibold py-3 rounded-xl text-white transition-all duration-200"
                style={{ background: `linear-gradient(90deg, ${ORANGE}, ${YELLOW})` }}
              >
                Continue to Dashboard
              </button>

              {countdown > 0 && (
                <p className="text-sm text-gray-500">
                  Redirecting automatically in {countdown} seconds...
                </p>
              )}
            </div>
          </div>
        )}

        {verificationStatus === 'error' && (
          <div className="space-y-4">
            <div className="bg-red-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-red-800">
                The verification link may be expired or invalid. Please request a new verification email.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleRetry}
                className="w-full font-semibold py-3 rounded-xl text-white transition-all duration-200"
                style={{ background: `linear-gradient(90deg, ${ORANGE}, ${YELLOW})` }}
              >
                Request New Verification Email
              </button>

              <button
                onClick={() => router.push("/auth/login")}
                className="w-full font-semibold py-3 rounded-xl transition-all duration-200"
                style={{
                  border: `2px solid ${ORANGE}`,
                  color: ORANGE,
                  background: WHITE,
                }}
              >
                Back to Login
              </button>
            </div>
          </div>
        )}

        {verificationStatus === 'checking' && (
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-blue-800">
                Please wait while we verify your email address...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifySuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: ORANGE }}></div>
          <p style={{ color: BLACK, opacity: 0.7 }}>Loading...</p>
        </div>
      </div>
    }>
      <VerifySuccessContent />
    </Suspense>
  );
}
