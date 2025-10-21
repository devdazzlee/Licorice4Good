"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
const ORANGE = "#FF5D39";
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

const ProductDetailPage = () => {
  const params = useParams();
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const id = typeof params?.id === "string" ? params.id : "";

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

  // Fetch product from backend API
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError("Product ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
          credentials: "include",
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError("Product not found");
          } else {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          setLoading(false);
          return;
        }

        const data = await response.json();

        // Handle different response formats
        if (data && data.id) {
          setProduct(data);
        } else if (data && data.product) {
          setProduct(data.product);
        } else {
          console.error("Unexpected product API response format:", data);
          throw new Error("Invalid product API response format");
        }
      } catch (err) {
        console.error("Failed to fetch product:", err);
        setError("Failed to load product. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const router = useRouter();
  const { addItem } = useCartStore();
  const {
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
    isInWishlist,
  } = useWishlistStore();

  const handleAddToCart = async () => {
    if (!product) return;

    setAddingToCart(true);
    try {
      await addItem({
        productId: product.id,
        productName: product.name,
        quantity,
        price: product.price,
        imageUrl: normalizeImageSrc(product.imageUrl, product.updatedAt),
        sku: product.sku,
      });

      // Redirect to cart page after successful addition
      router.push("/cart");
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;

    setAddingToCart(true);
    try {
      await addItem({
        productId: product.id,
        productName: product.name,
        quantity,
        price: product.price,
        imageUrl: normalizeImageSrc(product.imageUrl, product.updatedAt),
        sku: product.sku,
      });

      // Redirect directly to checkout for faster purchase
      router.push("/checkout");
    } catch (error) {
      console.error("Failed to buy now:", error);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlistToggle = () => {
    if (!product) return;

    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({
        productId: product.id,
        productName: product.name,
        price: product.price,
        imageUrl: normalizeImageSrc(product.imageUrl, product.updatedAt),
        sku: product.sku,
        category: product.category,
      });
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen layout py-10 bg-shop-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center py-20">
          <h3 className="text-2xl font-bold mb-2" style={{ color: BLACK }}>
            {error || "Product not found"}
          </h3>
          <p className="mb-6" style={{ color: BLACK, opacity: 0.7 }}>
            {error || "The product you're looking for doesn't exist."}
          </p>
          {!error && (
            <div className="mb-6 p-4 bg-gray-100 rounded-lg text-sm text-left">
              <div>
                <strong>Requested ID:</strong> {id}
              </div>
            </div>
          )}
          <Link
            href="/shop"
            className="inline-block bg-primary text-white font-bold px-8 py-3 rounded-lg shadow-lg hover:opacity-90 transition-all"
          >
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen layout py-6 sm:py-10 bg-shop-bg">
      <div className="max-w-6xl mx-auto px-3 sm:px-4">
        {/* Navigation */}
        <nav className="text-xs sm:text-sm mb-4 sm:mb-6 flex items-center gap-2 text-white">
          <Link href="/shop" className="hover:underline">
            Shop
          </Link>
          <span className="mx-1 text-gray-400">/</span>
          <span className="text-white font-semibold">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-12 bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg p-3 sm:p-4 lg:p-10">
          {/* Product Image */}
          <div className="relative">
            <div className="rounded-xl lg:rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-gradient-to-br from-gray-50 to-gray-100 relative group flex items-center justify-center p-4 sm:p-6 lg:p-8">
              <Image
                src={normalizeImageSrc(product.imageUrl, product.updatedAt)}
                alt={product.name}
                width={1000}
                height={1000}
                className="w-full h-auto max-h-[300px] sm:max-h-[400px] lg:max-h-[500px] object-contain transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 80vw, 600px"
                priority
              />
              <span
                className="absolute top-3 left-3 text-white text-xs sm:text-sm px-3 py-1.5 rounded-full shadow-lg font-semibold"
                style={{
                  background:
                    product.category === "Traditional"
                      ? "#8B4513"
                      : product.category === "Sour"
                      ? "#FF6B35"
                      : product.category === "Sweet"
                      ? "#FF69B4"
                      : ORANGE,
                }}
              >
                {product.category}
              </span>
            </div>
          </div>

          {/* Product Details */}
          <div className="flex flex-col justify-between space-y-3 sm:space-y-4 lg:space-y-6">
            <div className="space-y-2 sm:space-y-3 lg:space-y-4">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-black">
                {product.name}
              </h1>

              {/* SKU */}
              <div className="text-xs text-gray-500 font-mono">
                SKU: {product.sku}
              </div>

              {/* Price */}
              <div className="space-y-2 sm:space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <span
                    className="text-xl sm:text-2xl font-bold"
                    style={{ color: ORANGE }}
                  >
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="text-xs text-gray-500">
                    per pack
                  </span>
                  {product.stock !== undefined && (
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        product.stock > 20
                          ? "bg-green-100 text-green-700"
                          : product.stock > 10
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {product.stock > 20
                        ? "In Stock"
                        : product.stock > 10
                        ? "Low Stock"
                        : "Limited"}{" "}
                      ({product.stock})
                    </span>
                  )}
                </div>
                {/* Total Price Display */}
                {quantity > 1 && (
                  <div className="rounded-lg p-2 bg-orange-50 border border-orange-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Total for {quantity} pack{quantity > 1 ? "s" : ""}:
                      </span>
                      <span className="text-lg font-bold text-orange-600">
                        ${(product.price * quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                {product.description}
              </p>

              {/* Flavors with Checkboxes */}
              <div>
                <h3 className="font-medium text-black mb-2 text-sm">
                  Contains:
                </h3>
                <div className="space-y-2">
                  {Array.isArray(product.flavors) &&
                  product.flavors.length > 0 ? (
                    product.flavors.map((flavor, index) => (
                      <label
                        key={index}
                        className="flex items-center gap-2 text-sm bg-gray-50 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                      >
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-4 h-4 text-orange-600 bg-white border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                        />
                        <span className="text-gray-700">
                          {flavor.name}{" "}
                          {flavor.quantity > 1 && `×${flavor.quantity}`}
                        </span>
                      </label>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">
                      No flavors listed.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Add to Cart Section */}
            <div className="space-y-4">
              <div className="flex flex-row items-center gap-4">
                <span className="text-black font-medium text-sm">
                  Quantity
                </span>
                <div className="flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden">
                  <button
                    type="button"
                    className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={product.stock || 99}
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(
                        Math.max(
                          1,
                          Math.min(
                            product.stock || 99,
                            Number(e.target.value) || 1
                          )
                        )
                      )
                    }
                    className="w-12 h-8 text-center font-medium text-sm text-gray-900 bg-transparent outline-none border-0 border-l border-r border-gray-300"
                  />
                  <button
                    type="button"
                    className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                    onClick={() =>
                      setQuantity((q) => Math.min(product.stock || 99, q + 1))
                    }
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
                {product.stock !== undefined && (
                  <span className="text-xs text-gray-500 ml-2">
                    Max: {product.stock}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  disabled={
                    addingToCart ||
                    (product.stock !== undefined && product.stock <= 0)
                  }
                  onClick={handleBuyNow}
                  className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-sm shadow-lg hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {addingToCart
                    ? "Processing..."
                    : product.stock !== undefined && product.stock <= 0
                    ? "Out of Stock"
                    : `Buy Now - $${(product.price * quantity).toFixed(2)}`}
                </button>
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={
                      addingToCart ||
                      (product.stock !== undefined && product.stock <= 0)
                    }
                    onClick={handleAddToCart}
                    className="flex-1 px-4 py-3 rounded-lg text-white font-bold text-sm shadow-lg hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#FF5D39]"
                    style={{ background: ORANGE }}
                  >
                    {addingToCart
                      ? "Adding..."
                      : product.stock !== undefined && product.stock <= 0
                      ? "Out of Stock"
                      : `Add to Cart`}
                  </button>
                  <button
                    type="button"
                    onClick={handleWishlistToggle}
                    className={`px-3 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-[#FF5D39] cursor-pointer ${
                      isInWishlist(product.id)
                        ? "border-red-500 text-red-500 hover:bg-red-50"
                        : "border-gray-300 text-gray-600 hover:border-[#FF5D39] hover:text-[#FF5D39]"
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill={isInWishlist(product.id) ? "currentColor" : "none"}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 gap-2 text-xs text-gray-600">
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                  <span className="text-green-600">✓</span>
                  Free shipping on orders over $50
                </div>
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                  <span className="text-green-600">✓</span>
                  30-day money-back guarantee
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
