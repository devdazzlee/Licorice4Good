"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useUser } from "@/hooks/useUser";
import { useOrdersStore } from "@/store/ordersStore";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
// Removed VerificationGuard - profile now shows login prompt instead of redirecting
import { useCartStore } from "@/store/cartStore";

const BLACK = "#000000";

const ProfileContent = () => {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { orders, loading: ordersLoading, fetchOrders } = useOrdersStore();
  const { clearCart } = useCartStore();
  const [activeTab, setActiveTab] = useState<"profile" | "orders">("profile");
  const [editMode, setEditMode] = useState(false);
  const [ordersPage, setOrdersPage] = useState<number>(1);
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [updatingProfile] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  // Check for payment success and clear cart
  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const orderParam = searchParams.get("order");

    if (sessionId && user) {
      // Payment was successful
      setPaymentSuccess(true);
      if (orderParam) {
        setOrderId(orderParam);
      }
      setActiveTab("orders"); // Switch to orders tab to show the new order

      // Clear the cart after successful payment
      clearCart().catch((error) => {
        console.error("Failed to clear cart after payment:", error);
      });

      // Refresh orders data to get updated payment status (with a small delay to ensure webhook processed)
      setTimeout(() => {
        fetchOrders({ page: 1, limit: 10 });
        setOrdersPage(1);
      }, 2000); // Increased delay to ensure webhook processes

      // Clean up URL parameters after handling
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);

      // Hide success message after 5 seconds
      setTimeout(() => {
        setPaymentSuccess(false);
      }, 5000);
    }
  }, [searchParams, user, clearCart, fetchOrders]);

  // Removed authentication redirect - show message instead

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        email: user.email || "",
        phone: (user as { phone?: string }).phone || "",
      });
    }
  }, [user]);

  useEffect(() => {
    if (user && !userLoading) {
      fetchOrders({ page: ordersPage, limit: 10 });
    }
  }, [user, userLoading, fetchOrders, ordersPage]);

  // Refresh orders when switching to orders tab
  useEffect(() => {
    if (activeTab === "orders" && user && !userLoading) {
      fetchOrders({ page: ordersPage, limit: 10 });
    }
  }, [activeTab, user, userLoading, fetchOrders, ordersPage]);

  // Show message if not authenticated (no redirect)
  if (!userLoading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Profile</h2>
          <p className="text-gray-600 mb-6">
            Login to view and manage your profile information.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push("/auth/login")}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-3 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all"
            >
              Login to View Profile
            </button>
            <button
              onClick={() => router.push("/shop")}
              className="w-full border-2 border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-50 transition-all"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleProfileUpdate = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: profileForm.name,
          phone: profileForm.phone,
        }),
      });

      if (response.ok) {
        // Update the user data in the store or refetch
        setEditMode(false);
        // Optionally refresh the page or update local state
        window.location.reload();
      } else {
        const errorData = await response.json();
        console.error(
          "Profile update error:",
          errorData.message || "Failed to update profile"
        );
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-700";
      case "shipped":
        return "bg-blue-100 text-blue-700";
      case "confirmed":
        return "bg-yellow-100 text-yellow-700";
      case "pending":
        return "bg-gray-100 text-gray-700";
      case "shipping_failed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };


  return (
    <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Payment Success Notification */}
          {paymentSuccess && (
            <div className="mb-6 p-4 rounded-xl shadow-lg border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-bold text-green-800">
                    Payment Successful! 🎉
                  </h3>
                  <p className="text-sm text-green-700">
                    Your order has been confirmed and your cart has been
                    cleared.
                    {orderId ? (
                      <span className="block mt-1">
                        Order ID:{" "}
                        <span className="font-mono font-semibold">
                          {orderId.slice(0, 8).toUpperCase()}
                        </span>
                      </span>
                    ) : (
                      <span className="block mt-1">
                        Your order will appear in the order history below.
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}


          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#FF5D39] to-[#F1A900] bg-clip-text text-transparent">
              My Account
            </h1>
            <p className="text-lg" style={{ color: BLACK, opacity: 0.7 }}>
              Manage your profile and view your order history
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-200 mb-8">
            {[
              { id: "profile", label: "Profile", icon: "👤" },
              { id: "orders", label: "Order History", icon: "📦" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "profile" | "orders")}
                className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-b-2 border-[#FF5D39] text-[#FF5D39]"
                    : "text-gray-500 hover:text-[#FF5D39]"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="bg-white rounded-2xl shadow-lg border p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-black">
                  Profile Information
                </h2>
                {/* <button
                onClick={() => setEditMode(!editMode)}
                className="px-4 py-2 rounded-lg border border-[#FF5D39] text-[#FF5D39] hover:bg-[#FF5D39] hover:text-white transition-colors cursor-pointer"
              >
                {editMode ? 'Cancel' : 'Edit Profile'}
              </button> */}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-black">
                    Name
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, name: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF5D39] text-black"
                    />
                  ) : (
                    <p className="text-black">{user?.name || "Anonymous"}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-black">
                    Email
                  </label>
                  <p className="text-black">{user?.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-black">
                    Phone
                  </label>
                  {editMode ? (
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          phone: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF5D39] text-black"
                    />
                  ) : (
                    <p className="text-black">
                      {(user as { phone?: string }).phone || "Anonymous"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-black">
                    Member Since
                  </label>
                  <p className="text-black">Unknown</p>
                </div>
              </div>

              {editMode && (
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={handleProfileUpdate}
                    disabled={updatingProfile}
                    className="px-6 py-2 bg-[#FF5D39] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {updatingProfile ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </div>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                  <button
                    onClick={() => setEditMode(false)}
                    className="px-6 py-2 border border-gray-300 text-black rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg border p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
                <div>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-black">
                    Order History
                  </h2>
                  <span className="block sm:inline text-xs sm:text-sm text-gray-600 mt-1 sm:mt-0 sm:ml-2">
                    {orders.length} order{orders.length !== 1 ? "s" : ""} found
                  </span>
                </div>
                <button
                  onClick={() => {
                    fetchOrders({ page: 1, limit: 10 });
                    setOrdersPage(1);
                  }}
                  disabled={ordersLoading}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-[#FF5D39] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60 text-sm sm:text-base"
                >
                  {ordersLoading ? "Refreshing..." : "Refresh"}
                </button>
              </div>

              {ordersLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF5D39] mx-auto mb-4"></div>
                  <p className="text-black">Loading orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📦</div>
                  <h3 className="text-xl font-semibold mb-2 text-black">
                    No orders yet
                  </h3>
                  <p className="text-black opacity-70 mb-6">
                    Start shopping to see your order history here.
                  </p>
                  <Link
                    href="/shop"
                    className="inline-block bg-[#FF5D39] text-white font-bold px-6 py-3 rounded-lg shadow-lg hover:opacity-90 transition-all"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
                        <div>
                          <h3 className="text-sm sm:text-base font-semibold text-black">
                            Order #{order.id?.slice(0, 8) || "Unknown"}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleDateString()
                              : "Date not available"}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex flex-col gap-2 items-end">
                            <span
                              className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(
                                order.status || "pending"
                              )}`}
                            >
                              {order.status === "delivered" ? "Delivered" :
                               order.status === "shipped" ? "Shipped" :
                               order.status === "confirmed" ? "Confirmed" :
                               order.status === "pending" ? "Processing" :
                               order.status === "shipping_failed" ? "Shipping Failed" :
                               order.status || "Processing"}
                            </span>
                            <p className="text-base sm:text-lg font-bold text-[#FF5D39]">
                              ${order.total.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <p className="text-xs sm:text-sm text-gray-600">
                            {order.orderItems?.length || 0} item
                            {order.orderItems?.length !== 1 ? "s" : ""}
                          </p>
                          
                          {/* Simple Status Display */}
                          <div className="flex items-center text-xs sm:text-sm">
                            {(order.paymentStatus === "completed" ||
                              order.paymentStatus === "paid") ? (
                              <div className="flex items-center text-green-600">
                                <svg
                                  className="w-3 h-3 sm:w-4 sm:h-4 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                <span className="font-medium">Paid</span>
                              </div>
                            ) : order.paymentStatus === "failed" ? (
                              <div className="flex items-center text-red-600">
                                <svg
                                  className="w-3 h-3 sm:w-4 sm:h-4 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                                <span className="font-medium">Payment Failed</span>
                              </div>
                            ) : (
                              // Check if order is recent (less than 24 hours old) to show spinning loader
                              (() => {
                                const isRecent = order.createdAt && 
                                  new Date(order.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000);
                                
                                return isRecent ? (
                                  <div className="flex items-center text-yellow-600">
                                    <span className="font-medium">Processing</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center text-gray-600">
                                    <svg
                                      className="w-3 h-3 sm:w-4 sm:h-4 mr-1"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                    <span className="font-medium">Payment Failed</span>
                                  </div>
                                );
                              })()
                            )}
                          </div>
                        </div>

                        {/* Shipping Information */}
                        {(order.shipmentId || order.trackingNumber || order.shippingStatus) && (
                          <div className="border-t border-gray-100 pt-2 sm:pt-3">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm">
                              <div className="flex items-center text-gray-600">
                                <svg
                                  className="w-3 h-3 sm:w-4 sm:h-4 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                  />
                                </svg>
                                <span className="font-medium">Shipping:</span>
                              </div>
                              <div className="text-right">
                                {order.shippingStatus && (
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    order.shippingStatus === 'delivered' ? 'bg-green-100 text-green-700' :
                                    order.shippingStatus === 'shipped' ? 'bg-blue-100 text-blue-700' :
                                    order.shippingStatus === 'label_created' ? 'bg-yellow-100 text-yellow-700' :
                                    order.shippingStatus === 'failed' ? 'bg-red-100 text-red-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {order.shippingStatus === 'delivered' ? 'Delivered' :
                                     order.shippingStatus === 'shipped' ? 'Shipped' :
                                     order.shippingStatus === 'label_created' ? 'Label Created' :
                                     order.shippingStatus === 'failed' ? 'Failed' :
                                     order.shippingStatus}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {order.trackingNumber && (
                              <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm">
                                <span className="text-gray-600">Tracking:</span>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-blue-600 text-xs sm:text-sm">
                                    {order.trackingNumber}
                                  </span>
                                  {order.trackingUrl && (
                                    <a
                                      href={order.trackingUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 underline text-xs"
                                    >
                                      Track
                                    </a>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {(order.shippingCarrier || order.shippingService) && (
                              <div className="mt-1 text-xs text-gray-500">
                                {order.shippingCarrier && (
                                  <span>Carrier: {order.shippingCarrier}</span>
                                )}
                                {order.shippingCarrier && order.shippingService && (
                                  <span className="mx-1">•</span>
                                )}
                                {order.shippingService && (
                                  <span>Service: {order.shippingService}</span>
                                )}
                                {order.shippingCost && order.shippingCost > 0 && (
                                  <span className="mx-1">•</span>
                                )}
                                {order.shippingCost && order.shippingCost > 0 && (
                                  <span>Cost: ${order.shippingCost.toFixed(2)}</span>
                                )}
                              </div>
                            )}
                            
                            {/* Shipping Error Display */}
                            {order.shippingError && (
                              <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-start">
                                  <svg className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                  </svg>
                                  <div className="text-sm">
                                    <p className="font-medium text-red-800">Shipping Issue</p>
                                    <p className="text-red-700 mt-1">{order.shippingError}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination Controls */}
              {orders.length > 0 && (
                <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                    Showing {orders.length} orders
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button
                      onClick={() => {
                        const newPage = Math.max(1, ordersPage - 1);
                        setOrdersPage(newPage);
                        fetchOrders({ page: newPage, limit: 10 });
                      }}
                      disabled={ordersPage <= 1 || ordersLoading}
                      className="px-2 sm:px-3 py-1 sm:py-2 rounded border border-gray-300 text-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-xs sm:text-sm"
                    >
                      <span className="hidden sm:inline">Previous</span>
                      <span className="sm:hidden">‹</span>
                    </button>
                    <span className="text-black px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm">
                      Page {ordersPage}
                    </span>
                    <button
                      onClick={() => {
                        const newPage = ordersPage + 1;
                        setOrdersPage(newPage);
                        fetchOrders({ page: newPage, limit: 10 });
                      }}
                      disabled={ordersLoading}
                      className="px-2 sm:px-3 py-1 sm:py-2 rounded border border-gray-300 text-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-xs sm:text-sm"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <span className="sm:hidden">›</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
  );
};

const ProfilePage = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5D39] mx-auto mb-4"></div>
            <p className="text-black text-lg">Loading profile...</p>
          </div>
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
};

export default ProfilePage;
