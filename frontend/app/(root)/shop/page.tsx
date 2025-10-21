"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import CustomButton from "@/components/custom/CustomButton";
import { useRouter } from "next/navigation";
import CustomPackBuilder from "@/components/ui/shop/CustomPackBuilder";
import { useUser } from "@/hooks/useUser";
import { useCartStore } from "@/store/cartStore";

const ORANGE = "#FF5D39";
const YELLOW = "#F1A900";
const BLACK = "#111111";

// Product data structure matching the backend API
type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string | null;
  imageUrl?: string | null;
  isActive?: boolean;
  stock?: number;
  flavors?: Array<{ name: string; quantity: number }>;
  sku?: string;
  updatedAt?: string;
};

const ShopPage = () => {
  const router = useRouter();
  const { loading: userLoading } = useUser();
  const { addPreDefinedPack } = useCartStore();
  const [packages, setPackages] = useState<Product[]>([]);
  const [threePackVariants, setThreePackVariants] = useState<
    Array<{
      id: string;
      title: string;
      kind: string;
      items: Array<{
        flavor_id: string;
        flavor_name: string;
        qty: number;
      }>;
      active: boolean;
      sku: string;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [retryLoading, setRetryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCustomBuilder, setShowCustomBuilder] = useState(false);
  const normalizeImageSrc = (src?: string | null, updatedAt?: string) => {
    if (!src) return "/assets/images/slider.png";

    // Handle static assets (served from frontend)
    if (src.startsWith("/assets")) {
      const cacheBuster = updatedAt
        ? `?t=${new Date(updatedAt).getTime()}`
        : `?t=${Date.now()}`;
      return `${src}${cacheBuster}`;
    }

    // Handle uploaded images (served from backend)
    if (src.startsWith("/uploads") || src.startsWith("uploads")) {
      const path = src.startsWith("/uploads") ? src : `/${src}`;
      const cacheBuster = updatedAt
        ? `?t=${new Date(updatedAt).getTime()}`
        : `?t=${Date.now()}`;

      // Always use the full API URL for uploaded images
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        console.error("NEXT_PUBLIC_API_URL is not defined");
        return `${path}${cacheBuster}`;
      }
      return `${apiUrl}${path}${cacheBuster}`;
    }

    // Handle full URLs (already complete)
    if (src.startsWith("http://") || src.startsWith("https://")) {
      const cacheBuster = updatedAt
        ? `?t=${new Date(updatedAt).getTime()}`
        : `?t=${Date.now()}`;
      return `${src}${cacheBuster}`;
    }

    // Default case - assume it needs API URL
    const cacheBuster = updatedAt
      ? `?t=${new Date(updatedAt).getTime()}`
      : `?t=${Date.now()}`;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      console.error("NEXT_PUBLIC_API_URL is not defined");
      return `${src}${cacheBuster}`;
    }

    // Ensure src starts with / for proper path construction
    const normalizedSrc = src.startsWith("/") ? src : `/${src}`;
    return `${apiUrl}${normalizedSrc}${cacheBuster}`;
  };

  // No authentication check - shop page is accessible to everyone
  // Authentication will be required only for adding items to cart

  // Fetch products from backend API (accessible to everyone)
  useEffect(() => {
    // Fetch products regardless of authentication status

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const API_URL = process.env.NEXT_PUBLIC_API_URL;

        const response = await fetch(`${API_URL}/products`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Ensure data is an array
        if (Array.isArray(data)) {
          setPackages(data);
        } else if (data && Array.isArray(data.products)) {
          setPackages(data.products);
        } else if (data && Array.isArray(data.data)) {
          setPackages(data.data);
        } else {
          console.error("Unexpected API response format:", data);
          // Use fallback data instead of throwing error
          throw new Error("Invalid API response format");
        }

        // Also fetch 3-pack variants
        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL;

          const threePackResponse = await fetch(`${API_URL}/3pack/product`, {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (threePackResponse.ok) {
            const threePackData = await threePackResponse.json();
            if (threePackData && threePackData.variants) {
              setThreePackVariants(threePackData.variants);
            }
          }
        } catch (threePackErr) {
          console.warn("Failed to fetch 3-pack variants:", threePackErr);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
        if (err instanceof Error) {
          if (err.name === "AbortError") {
            setError("Request timed out. Please try again.");
          } else {
            setError("Failed to load products. Please try again later.");
          }
        } else {
          setError("Failed to load products. Please try again later.");
        }

        setPackages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []); // No dependencies - fetch once on component mount

  const viewPackage = (id: string) => router.push(`/products/${id}`);

  const addPreDefinedPackToCart = async (recipeId: string, buyNow: boolean = false) => {
    try {
      await addPreDefinedPack(recipeId, 1);
      // Redirect to checkout for Buy Now, or cart for Add to Cart
      router.push(buyNow ? "/checkout" : "/cart");
    } catch (error) {
      console.error("Failed to add pre-defined pack to cart:", error);
    }
  };

  const buyNow = async (productId: string, productName: string, price: number, imageUrl: string, sku?: string) => {
    try {
      const { addItem } = useCartStore.getState();
      await addItem({
        productId,
        productName,
        quantity: 1,
        price,
        imageUrl,
        sku,
      });
      // Redirect directly to checkout for faster purchase
      router.push("/checkout");
    } catch (error) {
      console.error("Failed to buy now:", error);
    }
  };

  // Show loading while fetching products
  if (loading) {
    return (
      <div className="w-full min-h-screen layout py-10 bg-shop-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">
            {userLoading ? "Checking authentication..." : "Loading products..."}
          </p>
        </div>
      </div>
    );
  }

  // Shop page is accessible to everyone - no authentication required for browsing

  if (error && packages.length === 0) {
    return (
      <div className="w-full min-h-screen layout py-10 bg-shop-bg">
        <div className="w-full text-center">
          <h1 className="text-4xl font-extrabold mb-6">
            <span className="inline-block text-shop-gradient font-extrabold drop-shadow text-white">
              Shop Packages
            </span>
          </h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p className="font-bold">Error Loading Products</p>
            <p>{error}</p>
          </div>
          <button
            onClick={() => {
              setRetryLoading(true);
              window.location.reload();
            }}
            disabled={retryLoading}
            className="bg-white text-black font-bold px-8 py-3 rounded-lg shadow-lg hover:bg-gray-100 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {retryLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                Retrying...
              </div>
            ) : (
              "Try Again"
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full min-h-screen layout py-10 bg-shop-bg"
      style={{
        color: BLACK,
      }}
    >
      <div className="flex items-center gap-3 mb-8 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
          <span className="inline-block text-shop-gradient font-extrabold drop-shadow text-white">
            Shop Packages
          </span>
        </h1>
      </div>

      <div className="mb-6 sm:mb-8">
        <p className="text-white text-base sm:text-lg mb-4">
          Choose from our carefully curated licorice rope packages. Each package
          contains 3 delicious flavors for the perfect tasting experience.
        </p>
      </div>

      {/* Custom Pack Builder */}
      {showCustomBuilder && (
        <div className="mb-8">
          <CustomPackBuilder />
        </div>
      )}

      {/* Package grid: 4 cards per row on large screens, tighter spacing */}
      {!showCustomBuilder && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
          {/* Display 3-pack variants first */}
          {Array.isArray(threePackVariants) &&
            threePackVariants.map((variant) => (
              <div
                key={variant.id}
                className="group rounded-2xl overflow-hidden bg-white border-2 border-gray-100 hover:border-[#FF5D39] shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 h-full flex flex-col"
              >
                {/* Product Image Section */}
                <div className="relative bg-gradient-to-br from-purple-50 to-pink-50 overflow-hidden">
                  <div className="block p-4">
                    <Image
                      src="/assets/images/slider.png"
                      alt={variant.title}
                      width={640}
                      height={480}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="w-full aspect-square object-contain transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                    />
                  </div>
                  
                  {/* Category Badge */}
                  <span
                    className="absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full shadow-md backdrop-blur-sm"
                    style={{
                      background:
                        variant.kind === "Traditional"
                          ? "linear-gradient(135deg, #8B4513 0%, #A0522D 100%)"
                          : variant.kind === "Sour"
                          ? "linear-gradient(135deg, #FF6B35 0%, #FF8C5A 100%)"
                          : "linear-gradient(135deg, #FF69B4 0%, #FF89C9 100%)",
                      color: "white",
                    }}
                  >
                    {variant.kind}
                  </span>
                  
                  {/* Price Badge */}
                  <span
                    className="absolute top-3 right-3 text-base font-extrabold px-3 py-1 rounded-full shadow-lg backdrop-blur-sm"
                    style={{
                      background: "linear-gradient(135deg, #FF5D39 0%, #FF8F6B 100%)",
                      color: "white",
                    }}
                  >
                    $27.00
                  </span>
                </div>

                {/* Product Details Section */}
                <div className="p-4 flex flex-col flex-1">
                  {/* Title & Description */}
                  <div className="mb-3">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-xs font-bold text-purple-600">⭐ 3-PACK</span>
                    </div>
                    <h3 className="font-bold text-lg mb-1.5 text-gray-900 line-clamp-1">
                      {variant.title}
                    </h3>
                    <p className="text-gray-600 text-xs leading-relaxed line-clamp-2">
                      Pre-made 3-pack with {variant.kind.toLowerCase()} flavors
                    </p>
                  </div>

                  {/* Flavors with Checkboxes - Compact */}
                  {Array.isArray(variant.items) &&
                    variant.items.length > 0 && (
                      <div className="mb-3">
                        <h4 className="font-semibold text-xs text-gray-700 mb-1.5">
                          Contains:
                        </h4>
                        <div className="space-y-1">
                          {variant.items.slice(0, 3).map(
                            (
                              item: {
                                flavor_id: string;
                                flavor_name: string;
                                qty: number;
                              },
                              index: number
                            ) => (
                              <label
                                key={index}
                                className="flex items-center gap-1.5 text-xs text-gray-700 bg-gray-50 px-2 py-1.5 rounded cursor-pointer hover:bg-orange-50 transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  defaultChecked
                                  className="w-3.5 h-3.5 text-orange-600 bg-white border-gray-300 rounded focus:ring-1 focus:ring-orange-500 cursor-pointer"
                                />
                                <span className="flex-1">{item.flavor_name}</span>
                                {item.qty > 1 && (
                                  <span className="text-xs font-bold text-orange-600">
                                    ×{item.qty}
                                  </span>
                                )}
                              </label>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {/* Buttons - Compact */}
                  <div className="mt-auto space-y-1.5 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => addPreDefinedPackToCart(variant.id, true)}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-2.5 px-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-1.5 text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Buy Now
                    </button>
                    <button
                      onClick={() => addPreDefinedPackToCart(variant.id, false)}
                      className="w-full bg-gradient-to-r from-[#FF5D39] to-[#F1A900] hover:from-[#FF6B35] hover:to-[#FFB800] text-white font-bold py-2.5 px-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-1.5 text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}

          {/* Display regular packages */}
          {Array.isArray(packages) &&
            packages.map((pkg) => (
              <div
                key={pkg.id}
                className="group rounded-2xl overflow-hidden bg-white border-2 border-gray-100 hover:border-[#FF5D39] shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 h-full flex flex-col"
              >
                {/* Product Image Section */}
                <div className="relative bg-gradient-to-br from-orange-50 to-red-50 overflow-hidden">
                  <Link href={`/products/${pkg.id}`} className="block p-4">
                    <Image
                      src={normalizeImageSrc(pkg.imageUrl, pkg.updatedAt)}
                      alt={pkg.name}
                      width={640}
                      height={480}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="w-full aspect-square object-contain transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                    />
                  </Link>
                  
                  {/* Category Badge */}
                  <span
                    className="absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full shadow-md backdrop-blur-sm"
                    style={{
                      background:
                        pkg.category === "Traditional"
                          ? "linear-gradient(135deg, #8B4513 0%, #A0522D 100%)"
                          : pkg.category === "Sour"
                          ? "linear-gradient(135deg, #FF6B35 0%, #FF8C5A 100%)"
                          : pkg.category === "Sweet"
                          ? "linear-gradient(135deg, #FF69B4 0%, #FF89C9 100%)"
                          : "linear-gradient(135deg, #F1A900 0%, #FFB800 100%)",
                      color: "white",
                    }}
                  >
                    {pkg.category}
                  </span>
                  
                  {/* Price Badge */}
                  <span
                    className="absolute top-3 right-3 text-base font-extrabold px-3 py-1 rounded-full shadow-lg backdrop-blur-sm"
                    style={{
                      background: "linear-gradient(135deg, #FF5D39 0%, #FF8F6B 100%)",
                      color: "white",
                    }}
                  >
                    ${pkg.price.toFixed(2)}
                  </span>
                </div>

                {/* Product Details Section */}
                <div className="p-4 flex flex-col flex-1">
                  {/* Title & Description */}
                  <div className="mb-3">
                    <h3 className="font-bold text-lg mb-1.5 text-gray-900 line-clamp-1">
                      {pkg.name}
                    </h3>
                    <p className="text-gray-600 text-xs leading-relaxed line-clamp-2 mb-2">
                      {pkg.description}
                    </p>

                    {/* Stock Status */}
                    {pkg.stock !== undefined && (
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                          pkg.stock > 20
                            ? "bg-green-100 text-green-700"
                            : pkg.stock > 10
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {pkg.stock > 20
                          ? "In Stock"
                          : pkg.stock > 10
                          ? "Low Stock"
                          : "Limited"}{" "}
                        ({pkg.stock})
                      </span>
                    )}
                  </div>

                  {/* Flavors with Checkboxes - Compact */}
                  {Array.isArray(pkg.flavors) && pkg.flavors.length > 0 && (
                    <div className="mb-3">
                      <h4 className="font-semibold text-xs text-gray-700 mb-1.5">
                        Contains:
                      </h4>
                      <div className="space-y-1">
                        {pkg.flavors.slice(0, 3).map((flavor, index) => (
                          <label
                            key={index}
                            className="flex items-center gap-1.5 text-xs text-gray-700 bg-gray-50 px-2 py-1.5 rounded cursor-pointer hover:bg-orange-50 transition-colors"
                          >
                            <input
                              type="checkbox"
                              defaultChecked
                              className="w-3.5 h-3.5 text-orange-600 bg-white border-gray-300 rounded focus:ring-1 focus:ring-orange-500 cursor-pointer"
                            />
                            <span className="flex-1">{flavor.name}</span>
                            {flavor.quantity > 1 && (
                              <span className="text-xs font-bold text-orange-600">
                                ×{flavor.quantity}
                              </span>
                            )}
                          </label>
                        ))}
                        {pkg.flavors.length > 3 && (
                          <div className="text-xs text-gray-500 italic pl-2">
                            +{pkg.flavors.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Buttons - Compact */}
                  <div className="mt-auto space-y-1.5 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => buyNow(pkg.id, pkg.name, pkg.price, normalizeImageSrc(pkg.imageUrl, pkg.updatedAt), pkg.sku)}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-2.5 px-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-1.5 text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Buy Now
                    </button>
                    <button
                      onClick={() => viewPackage(pkg.id)}
                      className="w-full bg-gradient-to-r from-[#FF5D39] to-[#F1A900] hover:from-[#FF6B35] hover:to-[#FFB800] text-white font-bold py-2.5 px-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-1.5 text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}

          {/* Custom Pack Builder Card - at the end */}
          <div
            className="group rounded-2xl overflow-hidden bg-white border border-[#F1A900]/20 hover:border-[#F1A900] shadow-md hover:shadow-2xl transition-all duration-300 transform-gpu hover:-translate-y-1 h-full flex flex-col cursor-pointer"
            onClick={() => setShowCustomBuilder(!showCustomBuilder)}
          >
            <div className="relative">
              <div className="w-full aspect-[4/3] bg-gradient-to-br from-[#F1A900]/20 to-[#FF6B35]/20 flex items-center justify-center transition-transform duration-300 group-hover:scale-105 rounded-t-2xl">
                {/* Icon */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#F1A900] to-[#FF6B35] flex items-center justify-center shadow-lg">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
              </div>
              <span
                className="absolute top-3 sm:top-4 left-3 sm:left-4 text-xs sm:text-sm font-bold px-2.5 sm:px-3 py-1 rounded-full shadow"
                style={{
                  background: "#F1A900",
                  color: "white",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                }}
              >
                Custom
              </span>
              <span
                className="absolute top-3 sm:top-4 right-3 sm:right-4 text-sm sm:text-lg font-bold px-2.5 sm:px-3 py-1 rounded-full shadow"
                style={{
                  background: ORANGE,
                  color: "white",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                }}
              >
                $27.00
              </span>
            </div>
            <div className="p-4 sm:p-6 flex flex-col flex-1 gap-3 sm:gap-4">
              <div>
                <h3
                  className="font-extrabold text-lg sm:text-xl mb-2"
                  style={{ color: BLACK }}
                >
                  Build Your Own Pack
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-3 line-clamp-3">
                  Choose exactly 3 flavors from our collection to create your
                  unique custom pack
                </p>

                {/* Features */}
                <div className="space-y-1">
                  <h4 className="font-semibold text-xs text-gray-700">
                    Features:
                  </h4>
                  <div className="space-y-1">
                    <div className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F1A900]"></span>
                      Choose any 3 flavors
                    </div>
                    <div className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B35]"></span>
                      Same great price
                    </div>
                    <div className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F1A900]"></span>
                      Perfect for you
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-2 sm:pt-4 mt-auto">
                <CustomButton
                  title="Start Building"
                  className="w-full !bg-gradient-to-r !from-[#F1A900] !to-[#FF6B35] !text-white font-bold py-2.5 sm:py-3 rounded-lg shadow-lg transition-all hover:opacity-90"
                  onClick={() => setShowCustomBuilder(!showCustomBuilder)}
                />
              </div>
            </div>
          </div>
          {!Array.isArray(packages) && (
            <div className="col-span-full text-center py-12">
              <div className="bg-white rounded-lg p-8 shadow-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  No Products Available
                </h3>
                <p className="text-gray-600 mb-4">
                  Unable to load products at this time.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-primary text-white font-bold px-6 py-2 rounded-lg hover:opacity-90 transition-all"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-12 text-center">
        <p className="text-white text-lg mb-6">
          Each package contains 3 carefully selected licorice rope flavors for
          the perfect tasting experience.
        </p>
        <Link
          href="/Home"
          className="inline-block bg-white text-black font-bold px-8 py-3 rounded-lg shadow-lg hover:bg-gray-100 transition-all"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default ShopPage;
