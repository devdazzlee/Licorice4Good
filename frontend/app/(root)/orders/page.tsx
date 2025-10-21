"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const OrdersRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new track-order page
    router.push("/track-order");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-lg text-gray-600">Redirecting to order tracking...</p>
      </div>
    </div>
  );
};

export default OrdersRedirect;
