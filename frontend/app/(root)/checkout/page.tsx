"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import axios from "axios";
import Image from "next/image";
import { Loader2, Package, Truck, CreditCard, MapPin } from "lucide-react";

interface ShippingRate {
  id: string;
  carrier: string;
  serviceName: string;
  amount: number;
  estimatedDays: number;
  currency: string;
}

interface ShippingAddress {
  name: string;
  email: string;
  phone: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal } = useCartStore();
  
  const [loading, setLoading] = useState(false);
  const [calculatingShipping, setCalculatingShipping] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  
  // Shipping address state
  const [address, setAddress] = useState<ShippingAddress>({
    name: "",
    email: "",
    phone: "",
    street1: "",
    street2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
  });
  
  // Shipping rates state
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);
  const [showShippingOptions, setShowShippingOptions] = useState(false);

  useEffect(() => {
    if (items.length === 0) {
      router.push("/cart");
    }
  }, [items, router]);

  const subtotal = getTotal();
  const shippingCost = selectedRate?.amount || 0;
  const total = subtotal + shippingCost;

  // Form validation
  const isAddressValid = () => {
    return (
      address.name.trim() &&
      address.email.trim() &&
      address.phone.trim() &&
      address.street1.trim() &&
      address.city.trim() &&
      address.state.trim() &&
      address.zipCode.trim() &&
      address.country.trim()
    );
  };

  // Calculate shipping rates
  const calculateShipping = async () => {
    if (!isAddressValid()) {
      setError("Please fill in all required address fields");
      return;
    }

    setCalculatingShipping(true);
    setError(null);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/shippo/calculate-rates`,
        {
          shippingAddress: {
            name: address.name,
            email: address.email,
            phone: address.phone,
            street1: address.street1,
            city: address.city,
            state: address.state,
            zip: address.zipCode,
            country: address.country,
          },
          orderItems: items.map((item) => ({
            productId: item.isCustomPack ? null : item.productId,
            quantity: item.quantity,
            flavorIds: item.flavorIds || [],
          })),
        },
        { withCredentials: true }
      );

      if (response.data.rates && response.data.rates.length > 0) {
        // Map rates to the format expected by the component
        const mappedRates = response.data.rates.map((rate: any) => ({
          id: rate.objectId || rate.id,
          objectId: rate.objectId || rate.id,
          carrier: rate.carrier,
          serviceName: rate.serviceName,
          amount: rate.amount,
          estimatedDays: rate.estimatedDays,
          currency: rate.currency || 'USD',
        }));
        
        setShippingRates(mappedRates);
        setShowShippingOptions(true);
        // Auto-select the cheapest rate
        const cheapestRate = mappedRates.reduce((prev: ShippingRate, curr: ShippingRate) =>
          curr.amount < prev.amount ? curr : prev
        );
        setSelectedRate(cheapestRate);
      } else {
        setError("No shipping rates available for this address");
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error("Shipping calculation error:", error);
      setError(error.response?.data?.message || "Failed to calculate shipping rates");
    } finally {
      setCalculatingShipping(false);
    }
  };

  // Proceed to Stripe payment
  const handleProceedToPayment = async () => {
    if (!selectedRate) {
      setError("Please select a shipping option");
      return;
    }

    setProcessingPayment(true);
    setError(null);

    try {
      const orderItems = items.map((item) => ({
        productId: item.isCustomPack ? null : item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
        flavorIds: item.flavorIds || [],
        customPackName: item.customPackName || null,
      }));

      const orderData = {
        orderItems,
        orderNotes: notes || "Order from website",
        total: total,
        shippingAddress: {
          name: address.name,
          email: address.email,
          phone: address.phone,
          street: address.street2 ? `${address.street1}, ${address.street2}` : address.street1,
          city: address.city,
          state: address.state,
          zipCode: address.zipCode,
          country: address.country,
        },
        selectedShippingRate: {
          objectId: selectedRate.objectId || selectedRate.id,
          carrier: selectedRate.carrier,
          serviceName: selectedRate.serviceName,
          amount: selectedRate.amount,
        },
      };

      // Create Stripe Checkout Session with shipping included
      const resp = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/create-checkout-session`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderData,
            items: [
              // Product items
              ...items.map((it) => ({
                productName: it.productName,
                name: it.productName,
                price: it.price,
                quantity: it.quantity,
              })),
              // Shipping as separate line item
              {
                productName: `Shipping - ${selectedRate.carrier} (${selectedRate.serviceName})`,
                name: `Shipping - ${selectedRate.carrier}`,
                price: selectedRate.amount,
                quantity: 1,
              },
            ],
            successUrl: `${window.location.origin}/orders/success?session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${window.location.origin}/checkout`,
          }),
        }
      );

      if (!resp.ok) {
        const errorData = await resp.json();
        throw new Error(errorData.message || "Checkout failed");
      }

      const data = await resp.json();

      if (data.url) {
        window.location.href = data.url;
      } else if (data.sessionUrl) {
        window.location.href = data.sessionUrl;
      } else {
        throw new Error("No session URL returned");
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error("Payment error:", error);
      setError(error.message || "Failed to proceed to payment");
      setProcessingPayment(false);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Checkout
          </h1>
          <p className="text-gray-600">Complete your order in a few easy steps</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Address Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-[#FF5D39] to-[#FF8F6B] rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Shipping Address</h2>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={address.name}
                    onChange={(e) => setAddress({ ...address, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#FF5D39] focus:ring-2 focus:ring-[#FF5D39]/20 outline-none transition-all text-gray-900"
                    placeholder="John Smith"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={address.email}
                    onChange={(e) => setAddress({ ...address, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#FF5D39] focus:ring-2 focus:ring-[#FF5D39]/20 outline-none transition-all text-gray-900"
                    placeholder="john@example.com"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={address.phone}
                    onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#FF5D39] focus:ring-2 focus:ring-[#FF5D39]/20 outline-none transition-all text-gray-900"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                {/* Street Address 1 */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={address.street1}
                    onChange={(e) => setAddress({ ...address, street1: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#FF5D39] focus:ring-2 focus:ring-[#FF5D39]/20 outline-none transition-all text-gray-900"
                    placeholder="123 Main Street"
                  />
                </div>

                {/* Street Address 2 */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Apartment, suite, etc. (optional)
                  </label>
                  <input
                    type="text"
                    value={address.street2}
                    onChange={(e) => setAddress({ ...address, street2: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#FF5D39] focus:ring-2 focus:ring-[#FF5D39]/20 outline-none transition-all text-gray-900"
                    placeholder="Apt 4B"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#FF5D39] focus:ring-2 focus:ring-[#FF5D39]/20 outline-none transition-all text-gray-900"
                    placeholder="San Francisco"
                  />
                </div>

                {/* State */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#FF5D39] focus:ring-2 focus:ring-[#FF5D39]/20 outline-none transition-all text-gray-900"
                    placeholder="CA"
                  />
                </div>

                {/* ZIP Code */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ZIP Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={address.zipCode}
                    onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#FF5D39] focus:ring-2 focus:ring-[#FF5D39]/20 outline-none transition-all text-gray-900"
                    placeholder="94102"
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={address.country}
                    onChange={(e) => setAddress({ ...address, country: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#FF5D39] focus:ring-2 focus:ring-[#FF5D39]/20 outline-none transition-all text-gray-900"
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="GB">United Kingdom</option>
                    <option value="AU">Australia</option>
                  </select>
                </div>
              </div>

              {/* Calculate Shipping Button */}
              {!showShippingOptions && (
                <button
                  onClick={calculateShipping}
                  disabled={calculatingShipping || !isAddressValid()}
                  className="w-full mt-6 bg-gradient-to-r from-[#FF5D39] to-[#FF8F6B] text-white font-bold py-4 px-6 rounded-xl hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                  {calculatingShipping ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Calculating Shipping...
                    </>
                  ) : (
                    <>
                      <Truck className="w-5 h-5" />
                      Calculate Shipping
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Shipping Options Card */}
            {showShippingOptions && shippingRates.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <Truck className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Shipping Options</h2>
                </div>

                <div className="space-y-3">
                  {shippingRates.map((rate) => {
                    const isSelected = selectedRate?.id === rate.id;
                    return (
                      <div
                        key={rate.id}
                        onClick={() => setSelectedRate(rate)}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          isSelected
                            ? "border-[#FF5D39] bg-[#FF5D39]/5"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                isSelected
                                  ? "border-[#FF5D39] bg-[#FF5D39]"
                                  : "border-gray-300 bg-white"
                              }`}
                            >
                              {isSelected && (
                                <div className="w-2 h-2 bg-white rounded-full" />
                              )}
                            </div>
                            <div>
                              <p className={`font-semibold ${isSelected ? "text-[#FF5D39]" : "text-gray-900"}`}>
                                {rate.carrier} - {rate.serviceName}
                              </p>
                              <p className="text-sm text-gray-500">
                                Estimated delivery: {rate.estimatedDays} days
                              </p>
                            </div>
                          </div>
                          <p className={`text-lg font-bold ${isSelected ? "text-[#FF5D39]" : "text-gray-900"}`}>
                            ${rate.amount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => {
                    setShowShippingOptions(false);
                    setSelectedRate(null);
                    setShippingRates([]);
                  }}
                  className="w-full mt-4 text-[#FF5D39] font-semibold py-2 hover:underline"
                >
                  Change Address
                </button>
              </div>
            )}

            {/* Order Notes */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Notes (Optional)</h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special instructions for your order..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#FF5D39] focus:ring-2 focus:ring-[#FF5D39]/20 outline-none transition-all text-gray-900 bg-white placeholder:text-gray-400 resize-none"
                rows={4}
              />
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 sticky top-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Order Summary</h2>
              </div>

              {/* Cart Items */}
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.productName}
                        width={60}
                        height={60}
                        className="rounded-lg object-contain"
                      />
                    ) : (
                      <div className="w-[60px] h-[60px] bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-500" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-900 line-clamp-2">
                        {item.productName}
                      </p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      <p className="text-sm font-bold text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="border-t-2 border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal:</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Shipping:</span>
                  <span className="font-semibold">
                    {selectedRate ? `$${shippingCost.toFixed(2)}` : "Calculate"}
                  </span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t-2 border-gray-200">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Proceed to Payment Button */}
              <button
                onClick={handleProceedToPayment}
                disabled={!selectedRate || processingPayment}
                className="w-full mt-6 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-4 px-6 rounded-xl hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {processingPayment ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Proceed to Payment
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                🔒 Secure payment powered by Stripe
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

