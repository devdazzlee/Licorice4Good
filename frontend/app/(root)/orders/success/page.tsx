"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";

const ORANGE = "#FF5D39";
const YELLOW = "#F1A900";
const WHITE = "#FFFFFF";
const BLACK = "#000000";

function OrderSuccessContent() {
  const search = useSearchParams();
  const router = useRouter();
  const [seconds, setSeconds] = useState(8);
  const { clearCart } = useCartStore();

  const orderId = search.get("order") || "";
  const sessionId = search.get("session_id") || "";

  // Removed authentication check - page is now public for guest checkout

  // Clear cart immediately on successful checkout
  useEffect(() => {
    const clearCartOnSuccess = async () => {
      try {
        console.log("🛒 Clearing cart after successful checkout");
        await clearCart();
        console.log("✅ Cart cleared successfully on success page");
      } catch (error) {
        console.error("⚠️ Failed to clear cart on success page:", error);
      }
    };
    
    clearCartOnSuccess();
  }, [clearCart]);

  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    const redirect = setTimeout(() => router.replace("/shop"), 8000);
    return () => {
      clearInterval(timer);
      clearTimeout(redirect);
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30" />
      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-md rounded-2xl shadow-2xl border p-6 text-center"
        style={{ background: WHITE, borderColor: "#F3F3F3" }}
      >
        <div className="mx-auto w-14 h-14 rounded-full mb-4 flex items-center justify-center" style={{ background: `${ORANGE}10` }}>
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke={ORANGE}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M12 22a10 10 0 110-20 10 10 0 010 20z" />
          </svg>
        </div>
        <h1 className="text-2xl font-extrabold mb-1" style={{ color: BLACK }}>Payment Successful</h1>
        <p className="text-sm mb-4" style={{ color: BLACK, opacity: 0.8 }}>
          Thank you! Your order has been placed successfully.
        </p>
        <div className="text-xs mb-6" style={{ color: BLACK, opacity: 0.7 }}>
          {orderId && <div>Order: <span className="font-semibold" style={{ color: BLACK }}>{orderId.slice(0, 8)}</span></div>}
          {sessionId && <div>Session: <span className="font-mono" style={{ color: BLACK }}>{sessionId.slice(0, 10)}...</span></div>}
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => router.replace("/shop")}
            className="w-full sm:flex-1 font-semibold py-3 rounded-xl"
            style={{ background: `linear-gradient(90deg, ${ORANGE}, ${YELLOW})`, color: WHITE, border: "none" }}
          >
            Continue Shopping
          </button>
          <button
            onClick={() => router.replace("/")}
            className="w-full sm:flex-1 font-semibold py-3 rounded-xl"
            style={{ border: `2px solid ${ORANGE}`, color: ORANGE, background: WHITE }}
          >
            Back to Home
          </button>
        </div>
        <p className="text-xs mt-4" style={{ color: BLACK, opacity: 0.6 }}>
          Redirecting to shop in {seconds}s…
        </p>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: ORANGE }}></div>
          <p style={{ color: BLACK, opacity: 0.7 }}>Loading...</p>
        </div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}


