"use client";
import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useOrdersStore } from "@/store/ordersStore";
import { useUser } from "@/hooks/useUser";
import VerificationGuard from "@/components/auth/VerificationGuard";
import CustomButton from "@/components/custom/CustomButton";
import axios from "axios";

// Type definitions
interface Product {
  id: string;
  name: string;
  price: number;
  category?: string;
  imageUrl?: string;
  image?: string; // Alternative image field
  images?: string[]; // Array of images
  sku?: string;
  isActive?: boolean;
  description?: string;
  brand?: string;
  // Handle different possible API response structures
  title?: string; // Some APIs use 'title' instead of 'name'
  cost?: number; // Some APIs use 'cost' instead of 'price'
}

const CartPage = () => {
  const { user, loading: userLoading } = useUser();
  const {
    items,
    loading,
    error,
    updateQuantity,
    removeItem,
    clearCart,
    getTotal,
    loadFromBackend,
    addItem,
  } = useCartStore();

  const { createOrder, error: orderStoreError } = useOrdersStore();
  const router = useRouter();
  const [orderLoading, setOrderLoading] = useState<boolean>(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [clearCartLoading, setClearCartLoading] = useState<boolean>(false);
  const [notes, setNotes] = useState("");
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [recommendedLoading, setRecommendedLoading] = useState<boolean>(false);
  const [flavors, setFlavors] = useState<Array<{ id: string; name: string }>>(
    []
  );

  const fetchRecommendedProducts = useCallback(async () => {
    setRecommendedLoading(true);
    try {
      // Try multiple API endpoints to find products
      let response;
      let products: Product[] = [];

      // First try the main products API
      try {
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
          products = Array.isArray(data) ? data : data.products || data.data || [];
        }
      } catch (error) {
        console.log("Failed to fetch from products API:", error);
      }

      // If no products from main API, try backend directly
      if (products.length === 0) {
        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL;
          response = await fetch(`${API_URL}/products`, {
            credentials: "include",
          });
          
          if (response.ok) {
            const data = await response.json();
            products = Array.isArray(data) ? data : data.products || data.data || [];
          }
        } catch (error) {
          console.log("Failed to fetch from backend products:", error);
        }
      }

      // If still no products, try admin products endpoint
      if (products.length === 0) {
        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL;
          response = await fetch(`${API_URL}/admin/products`, {
            credentials: "include",
          });
          
          if (response.ok) {
            const data = await response.json();
            products = Array.isArray(data) ? data : data.products || data.data || [];
          }
        } catch (error) {
          console.log("Failed to fetch from admin products:", error);
        }
      }
// 
      if (products.length > 0) {
        // Normalize product data to handle different API response formats
        const normalizedProducts = products.map((product: any) => ({
          id: product.id,
          name: product.name || product.title || "Unknown Product",
          price: product.price || product.cost || 0,
          category: product.category || product.brand || "General",
          imageUrl: product.imageUrl || product.image || (product.images && product.images[0]) || null,
          sku: product.sku,
          isActive: product.isActive !== false,
          description: product.description,
          brand: product.brand
        }));

        // Filter out products already in cart
        const cartProductIds = items.map((item) => item.productId);
        const availableProducts = normalizedProducts.filter(
          (product: Product) =>
            product.id &&
            !cartProductIds.includes(product.id) &&
            product.isActive !== false
        );

        // Always show recommendations - if we have available products, show them
        // If no available products, show all products (user can still browse)
        let productsToShow = availableProducts;

        // If no products available (all in cart), show all products for browsing
        if (availableProducts.length === 0 && normalizedProducts.length > 0) {
          productsToShow = normalizedProducts.filter(
            (product: Product) => product.id && product.isActive !== false
          );
        }

        // Randomly select 2 products
        const shuffled = productsToShow.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 2);

        setRecommendedProducts(selected);
      } else {
        setRecommendedProducts([]);
      }
    } catch (error) {
      console.error("Failed to fetch recommended products:", error);
      setRecommendedProducts([]);
    } finally {
      setRecommendedLoading(false);
    }
  }, [items]);

  // Authentication check
  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/auth/login");
      return;
    }
  }, [user, userLoading, router]);

  // Fetch flavors for custom pack display
  const fetchFlavors = useCallback(async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;

      // Try multiple endpoints to find flavors
      let response;
      try {
        // Try 3pack flavors endpoint first (public)
        response = await axios.get(`${API_URL}/3pack/flavors`, {
          withCredentials: true,
        });
      } catch {
        // Fallback to products flavors endpoint (public)
        response = await axios.get(`${API_URL}/products/flavors`, {
          withCredentials: true,
        });
      }

      const flavorsData = Array.isArray(response.data)
        ? response.data
        : response.data?.flavors || [];
      setFlavors(
        flavorsData.map((flavor: { id: string; name: string }) => ({
          id: flavor.id,
          name: flavor.name,
        }))
      );
    } catch (error) {
      console.error("Failed to fetch flavors:", error);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadFromBackend();
      fetchRecommendedProducts();
      fetchFlavors();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Show loading while checking authentication
  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading cart...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return null;
  }

  const handleQuantity = async (itemId: string, quantity: number) => {
    await updateQuantity(itemId, quantity);
  };

  const handleRemoveItem = async (itemId: string) => {
    await removeItem(itemId);
  };

  const handleClearCart = async () => {
    setClearCartLoading(true);
    try {
      await clearCart();
    } finally {
      setClearCartLoading(false);
    }
  };

  const handleAddRecommendedProduct = async (product: Product) => {
    try {
      await addItem({
        productId: product.id,
        productName: product.name,
        quantity: 1,
        price: product.price,
        imageUrl: normalizeImageSrc(product.imageUrl),
        sku: product.sku,
      });
      // Refresh recommended products to show new ones
      setTimeout(() => {
      fetchRecommendedProducts();
      }, 500); // Small delay to ensure cart is updated
    } catch (error) {
      console.error("Failed to add recommended product:", error);
    }
  };

  const handleViewAllProducts = () => {
    router.push("/shop");
  };

  const getFlavorName = (flavorId: string) => {
    const flavor = flavors.find((f) => f.id === flavorId);
    return flavor ? flavor.name : flavorId;
  };

  // Helper function to normalize image URLs
  const normalizeImageSrc = (src?: string | null) => {
    if (!src) return "/assets/images/slider.png";

    // Handle static assets (served from frontend)
    if (src.startsWith("/assets")) {
      return src;
    }

    // Handle uploaded images (served from backend)
    if (src.startsWith("/uploads") || src.startsWith("uploads")) {
      const path = src.startsWith("/uploads") ? src : `/${src}`;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        console.error("NEXT_PUBLIC_API_URL is not defined");
        return path;
      }
      return `${apiUrl}${path}`;
    }

    // Handle full URLs (already complete)
    if (src.startsWith("http://") || src.startsWith("https://")) {
      return src;
    }

    // Default case - assume it needs API URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      console.error("NEXT_PUBLIC_API_URL is not defined");
      return src;
    }

    // Ensure src starts with / for proper path construction
    const normalizedSrc = src.startsWith("/") ? src : `/${src}`;
    return `${apiUrl}${normalizedSrc}`;
  };

  const checkout = async () => {
    setOrderError(null);
    try {
      setOrderLoading(true);

      if (items.length === 0) {
        throw new Error("Your cart is empty. Add some products to continue.");
      }

      // Enhanced product verification with detailed logging (skip custom packs)
      try {
        const regularItems = items.filter((item) => !item.isCustomPack);

        if (regularItems.length > 0) {
          const regularProductIds = regularItems.map((item) => item.productId);

          // Check if regular products exist by fetching them from backend
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
            credentials: "include",
          });

          if (response.ok) {
            const products = await response.json();

            const availableProductIds = Array.isArray(products)
              ? products.map((p: { id: string }) => p.id)
              : products.products?.map((p: { id: string }) => p.id) || [];

            const missingProducts = regularProductIds.filter(
              (id) => !availableProductIds.includes(id)
            );
            if (missingProducts.length > 0) {
              throw new Error(
                `Some items in your cart are no longer available. Please refresh your cart to see current availability.`
              );
            }
          }
        }
      } catch {
        // Continue anyway - backend will handle validation
      }

      // Convert cart items to order items format expected by backend
      const orderItems = items.map((item) => ({
        productId: item.isCustomPack ? null : item.productId,  // NULL for custom packs
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
        // Always include flavorIds for custom packs
        flavorIds: item.flavorIds || [],
        customPackName: item.customPackName || null,
      }));

      const orderData = {
        orderItems,
        orderNotes: notes || "Order from website",
        total: getTotal(),
      };

      const created = await createOrder(orderData);
      if (!created) {
        // Use the specific error from the orders store if available
        const specificError = orderStoreError || "Failed to create order";
        throw new Error(specificError);
      }

      // Validate that the order has an ID
      if (!created.id) {
        console.error("Order created but missing ID:", created);
        throw new Error("Order was created but is missing an ID. Please contact support.");
      }

      console.log("Order created successfully:", { orderId: created.id, order: created });

      // Create Stripe Checkout Session
      const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/create-checkout-session`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: created.id,
          items: items.map((item) => ({
            productId: item.isCustomPack ? item.id : item.productId,
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
            ...(item.isCustomPack && {
              isCustomPack: true,
              flavorIds: item.flavorIds,
              sku: item.sku,
            }),
          })),
          customerEmail: undefined, // Stripe will collect this
          shippingAddress: undefined, // Stripe will collect this
          successUrl: `${window.location.origin}/profile?order=${created.id}&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/cart`,
        }),
      });

      if (!resp.ok) {
        // Try to get the actual error message from the response
        try {
          const errorData = await resp.json();
          throw new Error(errorData.message || "Unable to start checkout");
        } catch {
          throw new Error("Unable to start checkout");
        }
      }

      const data = await resp.json();
      if (!data?.url) throw new Error("Invalid checkout session");
      window.location.href = data.url;
    } catch (e: unknown) {
      let message = "Failed to place order";

      // Handle different types of errors
      if (e && typeof e === "object") {
        if ("message" in e && typeof e.message === "string") {
          message = e.message;
        } else if (
          "response" in e &&
          e.response &&
          typeof e.response === "object"
        ) {
          // Handle axios-style errors
          const response = e.response as { data?: { message?: string } };
          if (response.data?.message) {
            message = response.data.message;
          }
        }
      }

      setOrderError(message);
    } finally {
      setOrderLoading(false);
    }
  };

  return (
    <VerificationGuard>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-[#FF5D39] to-[#F1A900] bg-clip-text text-transparent">
              Shopping Cart
            </h1>
            <p className="text-gray-600">
              Review your items and proceed to checkout
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              <span className="ml-3 text-lg text-gray-600">Loading your cart...</span>
            </div>
          )}

          {/* Empty Cart */}
          {!loading && items.length === 0 && (
            <div className="text-center py-16">
              <div className="mx-auto h-24 w-24 mb-4 text-gray-300">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Your cart is empty</h3>
              <p className="mb-6 text-gray-600">{`Looks like you haven't added any items to your cart yet.`}</p>
              <CustomButton
                title="Start Shopping"
                onClick={() => router.push("/shop")}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              />
            </div>
          )}

          {/* Main Cart Layout */}
          {items.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Side - Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Cart Items ({items.length})
                  </h2>
                  <button
                    onClick={handleClearCart}
                    disabled={clearCartLoading}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    {clearCartLoading ? (
                      <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                    Clear Cart
                  </button>
                </div>

              {items.map((item) => {
                const unit = item.price;
                return (
                  <div
                    key={item.id}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
                  >
                      <div className="flex gap-6 p-6">
                        {/* Product Image */}
                        <div className="flex-shrink-0 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 flex items-center justify-center">
                          <Image
                            src={item.isCustomPack ? "/assets/images/slider.png" : normalizeImageSrc(item.imageUrl)}
                            alt={item.isCustomPack ? "Custom 3-Pack" : item.productName}
                            width={120}
                            height={120}
                            className="w-32 h-32 object-contain rounded-xl"
                            onError={(e) => {
                              // Fallback to default image if the image fails to load
                              const target = e.target as HTMLImageElement;
                              target.src = "/assets/images/slider.png";
                            }}
                          />
                        </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold text-gray-900 truncate mb-2">
                                {item.productName}
                              </h3>
                              {item.isCustomPack && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                                  Custom 3-Pack
                                </span>
                              )}
                            </div>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>

                          {/* Custom Pack Flavors */}
                          {item.isCustomPack && item.flavorIds && item.flavorIds.length > 0 && (
                            <div className="mb-4">
                              <div className="flex flex-wrap gap-2">
                                {item.flavorIds.map((flavorId) => (
                                  <span
                                    key={flavorId}
                                    className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-purple-100 text-purple-700"
                                  >
                                    {getFlavorName(flavorId)}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                              {/* Quantity Controls */}
                              <div className="flex items-center border-2 border-gray-300 rounded-xl bg-gray-50">
                                <button
                                  type="button"
                                  className="p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors rounded-l-xl"
                                  onClick={() => handleQuantity(item.id, Math.max(1, item.quantity - 1))}
                                >
                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                  </svg>
                                </button>
                                <input
                                  type="number"
                                  min={1}
                                  value={item.quantity || 1}
                                  onChange={(e) => handleQuantity(item.id, Number(e.target.value) || 1)}
                                  className="w-16 text-center font-semibold text-base text-gray-900 bg-transparent outline-none border-0"
                                />
                                <button
                                  type="button"
                                  className="p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors rounded-r-xl"
                                  onClick={() => handleQuantity(item.id, item.quantity + 1)}
                                >
                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                  </svg>
                                </button>
                              </div>

                              <div className="text-base text-gray-600 font-medium">
                                ${unit.toFixed(2)} each
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-2xl font-bold text-gray-900">
                                ${(item.price * item.quantity).toFixed(2)}
                              </div>
                            </div>
                          </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              
              </div>

              {/* Right Side - Order Summary & Checkout */}
              <div className="lg:col-span-1">
                <div className="sticky top-6 space-y-6">
                  {/* Order Summary */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Order Summary
                  </h2>

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium text-gray-900">
                        ${getTotal().toFixed(2)}
                      </span>
                    </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Shipping</span>
                        <span className="text-green-600 font-medium">Free</span>
                    </div>
                      <div className="border-t border-gray-200 pt-3">
                        <div className="flex justify-between">
                          <span className="text-base font-semibold text-gray-900">Total</span>
                          <span className="text-xl font-bold text-orange-600">
                        ${getTotal().toFixed(2)}
                      </span>
                    </div>
                  </div>
                  </div>

                    {/* Order Notes */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Order Notes (Optional)
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none placeholder:text-gray-400"
                        rows={2}
                        placeholder="Special instructions..."
                      />
                    </div>

                    {/* Error Display */}
                  {orderError && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{orderError}</p>
                                  </div>
                                )}

                    {/* Checkout Button */}
                      <CustomButton
                      title="Proceed to Checkout"
                      onClick={checkout}
                      loading={orderLoading}
                      loadingText="Processing..."
                      disabled={orderLoading}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                    />
                  </div>

                  {/* Custom Pack Builder */}
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-200 p-6">
                    <div className="flex items-center mb-3">
                      <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Create Custom Pack
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Build your perfect 3-pack by choosing any 3 flavors you love!
                    </p>
                    <div className="bg-white rounded-lg p-3 mb-4 border border-orange-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">Custom 3-Pack</h4>
                          <p className="text-xs text-gray-600">Choose 3 flavors • Same price</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-orange-600">$27.00</div>
                          <div className="text-xs text-green-600 font-medium">✓ Same Price</div>
                        </div>
                        </div>
                      </div>
                    <CustomButton
                      title="Build Custom Pack"
                      onClick={() => router.push("/shop")}
                      className="w-full !bg-white !text-black border-2 border-orange-300 hover:!bg-orange-50 font-semibold py-2.5 rounded-lg transition-all duration-200 text-sm"
                    />
                  </div>

                  {/* Security Notice */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <p className="text-sm text-blue-800">
                        Secure checkout powered by industry-standard encryption. Your payment information is protected.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </VerificationGuard>
  );
};

export default CartPage;