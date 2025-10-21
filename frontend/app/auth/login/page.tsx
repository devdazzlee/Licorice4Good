"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import AuthCard from "@/components/ui/auth/AuthCard";
import PasswordInput from "@/components/ui/auth/PasswordInput";
import { clearAuthCookies, checkCookieExpiry } from "@/utils/cookieUtils";
import { clearUserCache } from "@/hooks/useUser";
import { ToastContainer, toast } from "react-toastify";

// Helper function for fallback error messages
const getFallbackMessage = (status: number | undefined): string => {
  if (!status) {
    return "Network error. Please check your connection and try again.";
  }

  switch (status) {
    case 400:
      return "Invalid request. Please check your input.";
    case 401:
      return "Invalid credentials. Please check your email and password.";
    case 403:
      return "Access denied. You don't have permission to perform this action.";
    case 404:
      return "Resource not found. Please try again.";
    case 409:
      return "Account conflict. Please contact support.";
    case 422:
      return "Validation failed. Please check your input.";
    case 429:
      return "Too many login attempts. Please try again later.";
    case 500:
      return "Server error. Please try again later.";
    case 502:
      return "Bad gateway. Please try again later.";
    case 503:
      return "Service unavailable. Please try again later.";
    default:
      return `Login failed (${status}). Please try again.`;
  }
};

const LoginPage = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Clear expired cookies on component mount
  React.useEffect(() => {
    if (checkCookieExpiry()) {
      clearAuthCookies();
    }
  }, []);

  // GlobalVerificationCheck handles redirects for logged-in users

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await axios.post(
        `${API_URL}/auth/login`,
        { email: form.email, password: form.password },
        { withCredentials: true }
      );

      // Check if user needs verification - only redirect if explicitly required
      if (response.data?.requiresVerification) {
        // Redirect to verification page with email
        router.push(
          `/auth/verify-email?email=${encodeURIComponent(form.email)}`
        );
        return;
      }

      // Store user data in memory for immediate access
      const userData = response.data?.user;
      
      toast.success("Login successful!");
      setSuccess("Login successful!");
      
      // Clear user cache to ensure fresh data is fetched after login
      clearUserCache();
      
      // Check for redirect parameter
      const urlParams = new URLSearchParams(window.location.search);
      const redirectTo = urlParams.get('redirect');
      
      // Small delay to show success message, then force full page reload
      // This ensures the cookie is properly set and read by the next page
      setTimeout(() => {
        if (redirectTo) {
          // Redirect to the originally requested page
          window.location.href = redirectTo;
        } else if (userData?.role === "admin") {
          // Redirect to dashboard with full page reload
          window.location.href = "/dashboard/admin";
        } else {
          window.location.href = "/";
        }
      }, 500);
    } catch (err: unknown) {

      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const responseData = err.response?.data;

        // Log the full response for debugging

        // Handle different types of backend errors
        if (responseData) {
          let errorMessage = "";

          // Check for verification-related errors
          if (
            status === 403 &&
            (responseData.message?.includes("verification") ||
              responseData.message?.includes("verify"))
          ) {
            // User needs to verify email - redirect to verification page
            router.push(
              `/auth/verify-email?email=${encodeURIComponent(form.email)}`
            );
            return;
          }

          // Check for details array (your specific backend format)
          if (responseData.details && Array.isArray(responseData.details)) {
            // Extract messages from details array
            const messages = responseData.details.map(
              (detail: { msg?: string; path?: string }) => {
                if (detail.msg) {
                  return detail.msg;
                }
                return `${detail.path}: ${detail.msg || "Invalid value"}`;
              }
            );
            errorMessage = messages.join("; ");
          }
          // Check for other error formats
          else if (responseData.error) {
            errorMessage = responseData.error;
          } else if (responseData.message) {
            errorMessage = responseData.message;
          } else if (responseData.errors) {
            // Handle validation errors array or object
            if (Array.isArray(responseData.errors)) {
              errorMessage = responseData.errors.join(", ");
            } else if (typeof responseData.errors === "object") {
              // Handle object with field-specific errors
              const errorMessages = Object.entries(responseData.errors).map(
                ([field, messages]) => {
                  if (Array.isArray(messages)) {
                    return `${field}: ${messages.join(", ")}`;
                  } else {
                    return `${field}: ${messages}`;
                  }
                }
              );
              errorMessage = errorMessages.join("; ");
            } else {
              errorMessage = String(responseData.errors);
            }
          } else if (responseData.msg) {
            errorMessage = responseData.msg;
          } else if (responseData.description) {
            errorMessage = responseData.description;
          } else if (typeof responseData === "string") {
            errorMessage = responseData;
          } else if (responseData.data && responseData.data.message) {
            errorMessage = responseData.data.message;
          }

          // Show the exact backend error in toast
          if (errorMessage) {
            toast.error(errorMessage);
            setError(errorMessage);
          } else {
            // Fallback based on status codes
            const fallbackMsg = getFallbackMessage(status);
            toast.error(fallbackMsg);
            setError(fallbackMsg);
          }
        } else {
          // No response data
          const fallbackMsg =
            "Network error. Please check your connection and try again.";
          toast.error(fallbackMsg);
          setError(fallbackMsg);
        }
      } else {
        // Non-axios error
        const message =
          err instanceof Error
            ? err.message
            : "Login failed. Please try again.";
        toast.error(message);
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <AuthCard
        title="Welcome back"
        subtitle="Enter your credentials to access your account"
        footer={null}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}
          {success && (
            <div className="text-green-600 text-sm text-center">{success}</div>
          )}

          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-black font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-black placeholder-gray-400 bg-white"
              autoComplete="email"
              required
            />
          </div>

          <PasswordInput
            id="password"
            name="password"
            label="Password"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
          />

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <input id="remember" type="checkbox" className="h-4 w-4" />
              <label htmlFor="remember" className="text-gray-700">
                Remember me
              </label>
            </div>
            <Link
              href="/auth/forgot-password"
              className="text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="bg-primary text-white font-semibold py-2 rounded hover:bg-orange-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </AuthCard>
    </>
  );
};

export default LoginPage;
