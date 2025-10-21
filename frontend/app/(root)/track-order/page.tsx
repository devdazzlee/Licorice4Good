"use client";
import React, { useState, useEffect, Suspense } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";

const BLACK = "#000000";
const ORANGE = "#FF5D39";

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  total: number;
  customPackName?: string;
  flavorIds: string[];
}

interface Order {
  id: string;
  userId?: string;
  guestId?: string;
  guestEmail?: string;
  status: string;
  paymentStatus: string;
  total: number;
  shippingAddress: {
    name: string;
    email: string;
    phone: string;
    street1: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  orderNotes?: string;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
}

const TrackOrderContent = () => {
  const [orderNumber, setOrderNumber] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Auto-populate and search if order param is in URL
  useEffect(() => {
    const orderParam = searchParams.get("order");
    if (orderParam) {
      setOrderNumber(orderParam);
      // Automatically search for the order
      searchOrder(orderParam);
    }
  }, [searchParams]);

  const searchOrder = async (orderId: string) => {
    if (!orderId.trim()) {
      setError("Please enter an order number");
      return;
    }

    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await axios.get(
        `${API_URL}/orders/${orderId.trim()}`,
        { withCredentials: true }
      );

      setOrder(response.data);
    } catch (err: unknown) {
      const error = err as { response?: { status?: number; data?: { message?: string } } };
      if (error.response?.status === 404) {
        setError("Order not found. Please check your order number and try again.");
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("Failed to fetch order. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    searchOrder(orderNumber);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: BLACK }}>
            Track Your Order
          </h1>
          <p className="text-lg text-gray-600">
            Enter your order number to view order details
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <form onSubmit={handleTrackOrder} className="space-y-4">
            <div>
              <label
                htmlFor="orderNumber"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Order Number
              </label>
              <input
                type="text"
                id="orderNumber"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="Enter your order number (e.g., cm...)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 text-base"
              />
              <p className="text-xs text-gray-500 mt-2">
                You can find your order number in your confirmation email
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold text-white transition-all duration-200 disabled:opacity-50"
              style={{ backgroundColor: ORANGE }}
            >
              {loading ? "Searching..." : "Track Order"}
            </button>
          </form>
        </div>

        {/* Order Details */}
        {order && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Order Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    Order #{order.id ? order.id.slice(0, 8).toUpperCase() : 'N/A'}
                  </h2>
                  <p className="text-sm opacity-90">
                    Placed on {new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">${order.total ? order.total.toFixed(2) : '0.00'}</div>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Badges */}
              <div className="flex flex-wrap gap-3">
                {order.status && (
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                )}
                {order.paymentStatus && (
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold ${getPaymentStatusColor(
                      order.paymentStatus
                    )}`}
                  >
                    {order.paymentStatus.charAt(0).toUpperCase() +
                      order.paymentStatus.slice(1)}
                  </span>
                )}
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-xl font-bold mb-4" style={{ color: BLACK }}>
                  Order Items
                </h3>
                <div className="space-y-3">
                  {order.orderItems && order.orderItems.length > 0 ? (
                    order.orderItems.map((item) => (
                      <div
                        key={item.id || Math.random()}
                        className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {item.customPackName || `Product #${item.productId}`}
                          </p>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity || 0}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            ${item.total ? item.total.toFixed(2) : '0.00'}
                          </p>
                          <p className="text-sm text-gray-600">
                            ${item.price ? item.price.toFixed(2) : '0.00'} each
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No items found</p>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="text-xl font-bold mb-4" style={{ color: BLACK }}>
                  Shipping Address
                </h3>
                {order.shippingAddress ? (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-semibold text-gray-900">
                      {order.shippingAddress.name || 'N/A'}
                    </p>
                    <p className="text-gray-600">{order.shippingAddress.street1 || 'N/A'}</p>
                    <p className="text-gray-600">
                      {order.shippingAddress.city || 'N/A'}, {order.shippingAddress.state || 'N/A'}{" "}
                      {order.shippingAddress.zip || 'N/A'}
                    </p>
                    <p className="text-gray-600">{order.shippingAddress.country || 'N/A'}</p>
                    {order.shippingAddress.email && (
                      <p className="text-gray-600 mt-2">
                        Email: {order.shippingAddress.email}
                      </p>
                    )}
                    {order.shippingAddress.phone && (
                      <p className="text-gray-600">
                        Phone: {order.shippingAddress.phone}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">No shipping address available</p>
                )}
              </div>

              {/* Order Notes */}
              {order.orderNotes && (
                <div>
                  <h3 className="text-xl font-bold mb-4" style={{ color: BLACK }}>
                    Order Notes
                  </h3>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-700">{order.orderNotes}</p>
                  </div>
                </div>
              )}

              {/* Need Help Section */}
              <div className="border-t pt-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Need Help?</strong> Contact our support team at{" "}
                    <a
                      href="mailto:support@licorice4good.com"
                      className="underline font-semibold"
                    >
                      support@licorice4good.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Back to Home */}
        <div className="text-center mt-8">
          <button
            onClick={() => router.push("/")}
            className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

const TrackOrderPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center">
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <TrackOrderContent />
    </Suspense>
  );
};

export default TrackOrderPage;

