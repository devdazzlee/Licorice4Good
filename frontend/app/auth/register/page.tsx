"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthCard from "@/components/ui/auth/AuthCard";
import PasswordInput from "@/components/ui/auth/PasswordInput";
import { useUser } from "@/hooks/useUser";
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
      return "Authentication required. Please log in to access this feature.";
    case 403:
      return "Access denied. You don't have permission to perform this action.";
    case 404:
      return "Resource not found. Please try again.";
    case 409:
      return "Email already in use. Please try a different email.";
    case 422:
      return "Validation failed. Please check your input.";
    case 429:
      return "Too many requests. Please try again later.";
    case 500:
      return "Server error. Please try again later.";
    case 502:
      return "Bad gateway. Please try again later.";
    case 503:
      return "Service unavailable. Please try again later.";
    default:
      return `Registration failed (${status}). Please try again.`;
  }
};

const RegisterPage = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, loading: userLoading } = useUser();

  useEffect(() => {
    if (userLoading) return;
    if (user) {
      // If user is not verified, redirect to verification page
      if (!user.isVerified) {
        if (typeof window !== "undefined") {
          window.location.href = `/auth/verify-email?email=${encodeURIComponent(
            user.email
          )}`;
        } else if (router) {
          router.replace(
            `/auth/verify-email?email=${encodeURIComponent(user.email)}`
          );
        }
      } else {
        // User is verified, redirect to main site
        const redirectUrl =
          process.env.NEXT_PUBLIC_POST_AUTH_REDIRECT_URL || "/";
        if (typeof window !== "undefined") {
          window.location.href = redirectUrl;
        } else if (router) {
          router.replace(redirectUrl);
        }
      }
    }
  }, [user, userLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const password = form.password.trim();
    const confirmPassword = form.confirmPassword.trim();

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      await axios.post(
        `${API_URL}/auth/register`,
        { name, email, password },
        { withCredentials: true }
      );
      toast.success(
        "Registration successful! Please check your email to verify your account."
      );
      setSuccess(
        "Registration successful! Please check your email to verify your account."
      );
      setForm({ name: "", email: "", password: "", confirmPassword: "" });
      setTimeout(() => {
        // Redirect to verification page instead of main site
        if (typeof window !== "undefined") {
          window.location.href = `/auth/verify-email?email=${encodeURIComponent(
            email
          )}`;
        }
      }, 600);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const responseData = err.response?.data;

        // Log the full response for debugging

        // Handle different types of backend errors
        if (responseData) {
          let errorMessage = "";

          // Check for details array (your specific backend format)
          if (responseData.details && Array.isArray(responseData.details)) {
            // Extract messages from details array
            const messages = responseData.details.map(
              (detail: { msg: string; path: string }) => {
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
            : "Registration failed. Please try again.";
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
        title="Create your account"
        subtitle="Join us to start your fundraising journey"
        footer={
          <div>
            <span>Already have an account? </span>
            <Link href="/auth/login" className="text-primary hover:underline">
              Login
            </Link>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}
          {success && (
            <div className="text-green-600 text-sm text-center">{success}</div>
          )}
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-black font-medium">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-black placeholder-gray-400 bg-white"
              autoComplete="name"
              required
            />
          </div>
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
            autoComplete="new-password"
            required
          />

          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
            required
          />

          <button
            type="submit"
            className="bg-primary text-white font-semibold py-2 rounded hover:bg-orange-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </AuthCard>
    </>
  );
};

export default RegisterPage;
