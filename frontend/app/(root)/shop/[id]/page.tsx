"use client";
import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

const ProductDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const id =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
      ? params?.id[0]
      : "";

  // Redirect to new product pages since we only have packages, no single products
  useEffect(() => {
    // Redirect to the new product page structure
    router.replace(`/products/${id}`);
  }, [id, router]);

  // Show loading message while redirecting
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center py-20">
        <div className="mx-auto h-24 w-24 mb-4 flex items-center justify-center rounded-full border-4 border-[#FF5D39] bg-white shadow-lg">
          <svg
            fill="none"
            viewBox="0 0 24 24"
            stroke="#FF5D39"
            className="w-12 h-12 animate-spin"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </div>
        <h3
          className="text-2xl font-bold mb-2"
          style={{
            color: "#111111",
            letterSpacing: "-0.01em",
          }}
        >
          Redirecting to Product...
        </h3>
        <p
          className="mb-6"
          style={{
            color: "#111111",
            opacity: 0.7,
            fontSize: "1.1rem",
          }}
        >
          Taking you to the product page.
        </p>
      </div>
    </div>
  );
};

export default ProductDetailPage;