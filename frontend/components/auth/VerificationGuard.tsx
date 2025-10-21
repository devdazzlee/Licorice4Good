"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";

const ORANGE = "#FF5D39";
const YELLOW = "#F1A900";
const WHITE = "#FFFFFF";
const BLACK = "#000000";

interface VerificationGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function VerificationGuard({ children, fallback }: VerificationGuardProps) {
  const { user, loading, refreshUser } = useUser();
  const router = useRouter();
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    if (!loading && user && !user.isVerified) {
      setShowFallback(true);
    } else if (user && user.isVerified) {
      setShowFallback(false);
    }
  }, [user, loading]);

  // Add a refresh mechanism when component mounts
  useEffect(() => {
    if (user && !user.isVerified) {
      // Try to refresh user data to check if verification status has changed
      refreshUser();
    }
  }, [user, refreshUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: ORANGE }}></div>
          <p style={{ color: BLACK, opacity: 0.7 }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (showFallback) {
    return fallback || (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          {/* Header */}
          <div className="mb-8">
            <div className="mx-auto w-20 h-20 rounded-full mb-4 flex items-center justify-center" style={{ background: `${ORANGE}10` }}>
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke={ORANGE}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: BLACK }}>Email Verification Required</h1>
            <p className="text-gray-600">
              Please verify your email address to access this page
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="font-semibold mb-3" style={{ color: BLACK }}>What you need to do:</h3>
            <ol className="space-y-2 text-sm text-gray-600 text-left">
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-semibold flex items-center justify-center mr-3 mt-0.5">1</span>
                Check your email inbox for a verification link
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-semibold flex items-center justify-center mr-3 mt-0.5">2</span>
                Click the verification link to activate your account
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-semibold flex items-center justify-center mr-3 mt-0.5">3</span>
                Return here and refresh the page
              </li>
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => router.push(`/auth/verify-email?email=${encodeURIComponent(user?.email || '')}`)}
              className="w-full font-semibold py-3 rounded-xl text-white transition-all duration-200"
              style={{ background: `linear-gradient(90deg, ${ORANGE}, ${YELLOW})` }}
            >
              Go to Verification Page
            </button>

            <button
              onClick={async () => {
                await refreshUser();
                // Force a small delay to ensure user data is updated
                setTimeout(() => {
                  if (user?.isVerified) {
                    setShowFallback(false);
                  }
                }, 1000);
              }}
              className="w-full font-semibold py-3 rounded-xl transition-all duration-200"
              style={{
                border: `2px solid ${YELLOW}`,
                color: YELLOW,
                background: WHITE,
              }}
            >
              Refresh Status
            </button>

            <button
              onClick={() => router.push("/")}
              className="w-full font-semibold py-3 rounded-xl transition-all duration-200"
              style={{
                border: `2px solid ${ORANGE}`,
                color: ORANGE,
                background: WHITE,
              }}
            >
              Back to Home
            </button>
          </div>

          {/* Help */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Need help? Check your spam folder or contact support
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
