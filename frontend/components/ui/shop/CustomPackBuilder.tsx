"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useCartStore } from "@/store/cartStore";
import CustomButton from "@/components/custom/CustomButton";
import FlavorCard from "./FlavorCard";

type Flavor = {
  id: string;
  name: string;
  aliases: string[];
  imageUrl?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

type FlavorInventory = {
  flavorId: string;
  onHand: number;
  reserved: number;
  safetyStock: number;
};

const CustomPackBuilder = () => {
  const router = useRouter();
  const [flavors, setFlavors] = useState<Flavor[]>([]);
  const [inventory, setInventory] = useState<FlavorInventory[]>([]);
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { addCustomPack } = useCartStore();

  // Fetch available flavors
  useEffect(() => {
    const fetchFlavors = async () => {
      try {
        setLoading(true);
        const API_URL = process.env.NEXT_PUBLIC_API_URL;

        // Fetch flavors from public endpoint
        const flavorsResponse = await axios.get(`${API_URL}/3pack/flavors`, {
          withCredentials: true,
        });

        // Handle flavors response
        const flavorsData = Array.isArray(flavorsResponse.data)
          ? flavorsResponse.data
          : flavorsResponse.data?.flavors || [];

        // Filter only active flavors
        const activeFlavors = flavorsData.filter(
          (flavor: Flavor) => flavor.active
        );
        setFlavors(activeFlavors);

        // Try to fetch inventory data (optional - don't fail if endpoint doesn't exist)
        try {
          const inventoryResponse = await axios.get(
            `${API_URL}/admin/inventory/alerts`,
            { withCredentials: true }
          );

          // Handle inventory alerts response - map alerts to inventory format
          const alertsData = Array.isArray(inventoryResponse.data)
            ? inventoryResponse.data
            : inventoryResponse.data?.alerts || [];

          // Convert alerts to inventory format for easier use
          const inventoryData = alertsData.map(
            (alert: {
              flavorId: string;
              onHand?: number;
              reserved?: number;
              safetyStock?: number;
            }) => ({
              flavorId: alert.flavorId,
              onHand: alert.onHand || 0,
              reserved: alert.reserved || 0,
              safetyStock: alert.safetyStock || 0,
            })
          );

          setInventory(inventoryData);
        } catch (inventoryErr) {
          console.warn(
            "Inventory endpoint not available, continuing without stock data:",
            inventoryErr
          );
          // Set empty inventory array so stock checks will default to "in stock"
          setInventory([]);
        }
      } catch (err) {
        console.error("Failed to fetch flavors:", err);
        setError("Failed to load flavors. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchFlavors();
  }, []);

  const getFlavorStock = (flavorId: string) => {
    // If no inventory data available, assume flavors are in stock
    if (inventory.length === 0) {
      return 999; // Show as "in stock" when inventory data is not available
    }
    const flavorInventory = inventory.find((inv) => inv.flavorId === flavorId);
    // If no inventory alert exists for this flavor, it means it's in stock
    if (!flavorInventory) {
      return 999; // No alert = in stock
    }
    return flavorInventory.onHand - flavorInventory.reserved;
  };

  const isFlavorInStock = (flavorId: string) => {
    // If no inventory data available, assume flavors are in stock
    if (inventory.length === 0) {
      return true;
    }
    const flavorInventory = inventory.find((inv) => inv.flavorId === flavorId);
    // If no inventory alert exists for this flavor, it means it's in stock
    if (!flavorInventory) {
      return true; // No alert = in stock
    }
    return flavorInventory.onHand - flavorInventory.reserved > 0;
  };

  const toggleFlavor = (flavorId: string) => {
    if (selectedFlavors.includes(flavorId)) {
      // Remove flavor
      setSelectedFlavors((prev) => prev.filter((id) => id !== flavorId));
    } else if (selectedFlavors.length < 3) {
      // Add flavor (only if less than 3 selected)
      setSelectedFlavors((prev) => [...prev, flavorId]);
    }
  };

  const removeFlavor = (flavorId: string) => {
    setSelectedFlavors((prev) => prev.filter((id) => id !== flavorId));
  };

  const addCustomPackToCart = async () => {
    if (selectedFlavors.length !== 3) {
      setError("Please select exactly 3 flavors for your custom pack.");
      return;
    }

    setAddingToCart(true);
    setError(null);

    try {
      // Use the cart store's addCustomPack method
      await addCustomPack(selectedFlavors, 1);

      // Show success message
      setSuccess(true);

      // Reset selection
      setSelectedFlavors([]);

      // Redirect to cart page after a brief delay to show success message
      setTimeout(() => {
        router.push("/cart");
      }, 1500);
    } catch (err: unknown) {
      console.error("Failed to add custom pack to cart:", err);
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to add custom pack to cart.";
      setError(errorMessage);
    } finally {
      setAddingToCart(false);
    }
  };

  const selectedFlavorObjects = selectedFlavors
    .map((id) => flavors.find((flavor) => flavor.id === id))
    .filter(Boolean) as Flavor[];

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5D39] mx-auto mb-4"></div>
        <p className="text-gray-600">Loading flavors...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 md:p-8 shadow-xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#FF5D39] to-[#FF4520] rounded-full mb-4 shadow-lg">
          <span className="text-3xl">🎨</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
          Build Your Custom 3-Pack
        </h2>
        <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
          Choose exactly 3 flavors to create your perfect licorice combination
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <svg
                className="w-3 h-3 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p className="text-green-700 text-sm font-medium">
              Custom pack added to cart! Redirecting to cart page...
            </p>
          </div>
        </div>
      )}

      {/* Selection Counter */}
      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-full px-6 py-3 shadow-md border border-gray-200">
          <span className="text-sm sm:text-base font-bold text-gray-800">
            {selectedFlavors.length} of 3 flavors selected
          </span>
          <div className="flex gap-2">
            {[1, 2, 3].map((num) => (
              <div
                key={num}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  num <= selectedFlavors.length ? "bg-[#FF5D39] shadow-md scale-110" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Selected Flavors Preview */}
      {selectedFlavorObjects.length > 0 && (
        <div className="mb-8 bg-gradient-to-br from-[#FF5D39]/5 to-[#FF5D39]/10 rounded-2xl p-6 border-2 border-[#FF5D39]/20">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            Your Selection:
          </h3>
          <div className="flex flex-wrap gap-3">
            {selectedFlavorObjects.map((flavor) => (
              <div
                key={flavor.id}
                className="flex items-center gap-2 bg-gradient-to-r from-[#FF5D39] to-[#FF4520] text-white px-4 py-2.5 rounded-full text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                <span>{flavor.name}</span>
                <button
                  onClick={() => removeFlavor(flavor.id)}
                  className="hover:bg-white/30 rounded-full p-1.5 transition-all duration-200 hover:rotate-90"
                  title="Remove flavor"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Flavor Selection Grid */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
            Available Flavors
          </h3>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {flavors.length} flavors
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {flavors.map((flavor) => {
            const isSelected = selectedFlavors.includes(flavor.id);
            const inStock = isFlavorInStock(flavor.id);
            const stockCount = getFlavorStock(flavor.id);

            return (
              <FlavorCard
                key={flavor.id}
                flavor={flavor}
                isSelected={isSelected}
                inStock={inStock}
                stockCount={stockCount}
                onClick={() => toggleFlavor(flavor.id)}
                disabled={selectedFlavors.length >= 3 && !isSelected}
              />
            );
          })}
        </div>
      </div>

      {/* Add to Cart Button */}
      <div className="text-center">
        {(() => {
          const getButtonTitle = () => {
            if (success) return "Added to Cart!";
            if (addingToCart) return "Adding to Cart...";
            return "Add Custom Pack to Cart";
          };

          const getButtonClassName = () => {
            if (success) return "!bg-green-500 !text-white";
            if (selectedFlavors.length === 3)
              return "!bg-[#FF5D39] !text-white hover:opacity-90";
            return "!bg-gray-300 !text-gray-500 cursor-not-allowed";
          };

          return (
            <CustomButton
              title={getButtonTitle()}
              className={`w-full md:w-auto px-8 py-3 font-bold ${getButtonClassName()}`}
              onClick={addCustomPackToCart}
              disabled={selectedFlavors.length !== 3 || addingToCart || success}
            />
          );
        })()}

        {selectedFlavors.length !== 3 && (
          <p className="text-sm text-gray-500 mt-2">
            Select exactly 3 flavors to add to cart
          </p>
        )}
      </div>
    </div>
  );
};

export default CustomPackBuilder;
