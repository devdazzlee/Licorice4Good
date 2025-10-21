"use client";

import React, { useState } from 'react';

interface ShippingAddress {
  name: string;
  company?: string;
  email: string;
  phone?: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface ShippingAddressFormProps {
  onAddressSubmit: (address: ShippingAddress) => void;
  onCancel: () => void;
  loading?: boolean;
  userEmail?: string;
  userName?: string;
}

const ShippingAddressForm: React.FC<ShippingAddressFormProps> = ({
  onAddressSubmit,
  onCancel,
  loading = false,
  userEmail = '',
  userName = '',
}) => {
  const [formData, setFormData] = useState<ShippingAddress>({
    name: userName,
    company: '',
    email: userEmail,
    phone: '',
    street1: '',
    street2: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
  });

  const [errors, setErrors] = useState<Partial<ShippingAddress>>({});
  const [validating, setValidating] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof ShippingAddress]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ShippingAddress> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.street1.trim()) newErrors.street1 = 'Street address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.zip.trim()) newErrors.zip = 'ZIP code is required';

    // Prevent test/fake addresses
    const testWords = ['test', 'fake', 'demo', 'sample', 'example', 'dummy'];
    const isTestAddress = testWords.some(word => 
      formData.name.toLowerCase().includes(word) ||
      formData.street1.toLowerCase().includes(word) ||
      formData.city.toLowerCase().includes(word)
    );

    if (isTestAddress) {
      newErrors.city = 'Please enter a real address for shipping. Test addresses like "test" are not allowed.';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // ZIP code validation - more flexible for international addresses
    const zipRegex = /^[A-Za-z0-9\s\-]{3,10}$/;
    if (formData.zip && !zipRegex.test(formData.zip)) {
      newErrors.zip = 'Please enter a valid postal code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleValidateAddress = async () => {
    if (!validateForm()) return;

    setValidating(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/shippo/validate-address`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.isValid) {
        onAddressSubmit(formData);
      } else {
        // Show validation suggestions but still allow proceeding
        setErrors({ 
          street1: result.message || 'Address validation had issues, but you can still proceed if the address is correct.' 
        });
      }
    } catch (error) {
      console.error('Address validation error:', error);
      // If validation API fails, just proceed with the address
      if (validateForm()) {
        onAddressSubmit(formData);
      }
    } finally {
      setValidating(false);
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleValidateAddress();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping Address</h2>
      <p className="text-gray-600 mb-6">
        Please provide your shipping address to continue with your order.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your full name"
              required
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your email"
              required
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
            Company (Optional)
          </label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            placeholder="Enter company name"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number (Optional)
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            placeholder="Enter phone number"
          />
        </div>

        <div>
          <label htmlFor="street1" className="block text-sm font-medium text-gray-700 mb-1">
            Street Address *
          </label>
          <input
            type="text"
            id="street1"
            name="street1"
            value={formData.street1}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
              errors.street1 ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter street address"
            required
          />
          {errors.street1 && <p className="text-red-500 text-sm mt-1">{errors.street1}</p>}
        </div>

        <div>
          <label htmlFor="street2" className="block text-sm font-medium text-gray-700 mb-1">
            Apartment, Suite, etc. (Optional)
          </label>
          <input
            type="text"
            id="street2"
            name="street2"
            value={formData.street2}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            placeholder="Apartment, suite, unit, building, floor, etc."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              City *
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                errors.city ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter city"
              required
            />
            {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
          </div>

          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
              State *
            </label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                errors.state ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter state"
              required
            />
            {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
          </div>

          <div>
            <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-1">
              ZIP Code *
            </label>
            <input
              type="text"
              id="zip"
              name="zip"
              value={formData.zip}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                errors.zip ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter ZIP code"
              required
            />
            {errors.zip && <p className="text-red-500 text-sm mt-1">{errors.zip}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
            Country *
          </label>
          <select
            id="country"
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            required
          >
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="MX">Mexico</option>
          </select>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || validating}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || validating}
          >
            {validating ? 'Validating Address...' : 'Continue to Payment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ShippingAddressForm;
