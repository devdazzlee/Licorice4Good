"use client";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function VerifyEmailRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get the token and email from the old URL format
    const token = searchParams.get("token");
    const email = searchParams.get("email");
    
    // Redirect to the correct verification page with the same parameters
    const newUrl = `/auth/verify-email${token ? `?token=${token}` : ""}${email ? `${token ? '&' : '?'}email=${email}` : ""}`;
    
    router.replace(newUrl);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to verification page...</p>
      </div>
    </div>
  );
}

export default function VerifyEmailRedirect() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <VerifyEmailRedirectContent />
    </Suspense>
  );
}
