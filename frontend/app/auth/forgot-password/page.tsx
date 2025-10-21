'use client'
import React, { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import AuthCard from '@/components/ui/auth/AuthCard';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [redirecting, setRedirecting] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    // no-op

    if (!email) {
      setError('Please enter your email.');
      return;
    }

    try {
      setLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      await axios.post(`${API_URL}/auth/forgot-password`, { email }, { withCredentials: true });
      setSuccess('A 6-digit reset code has been sent to your email.');
      setRedirecting(true);
      setTimeout(() => {
        const nextUrl = `/auth/reset-password?email=${encodeURIComponent(email.trim().toLowerCase())}`;
        if (typeof window !== 'undefined') {
          window.location.href = nextUrl;
        }
      }, 800);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const serverMsg = (err.response?.data as { message?: string } | undefined)?.message;
        if (serverMsg) {
          setError(serverMsg);
        } else if (status === 404) {
          setError('Email not found');
        } else {
          setError('Unable to send reset code. Please try again.');
        }
      } else {
        const message = err instanceof Error ? err.message : 'Request failed.';
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a 6-digit code"
      footer={<Link href="/auth/login" className="text-primary hover:underline">Back to login</Link>}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}
        {success && <div className="text-green-600 text-sm text-center">{success}</div>}
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-black font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-black placeholder-gray-400 bg-white"
            autoComplete="email"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-primary text-white font-semibold py-2 rounded hover:bg-orange-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? 'Sending...' : redirecting ? 'Redirecting...' : 'Send reset code'}
        </button>
      </form>
    </AuthCard>
  );
};

export default ForgotPasswordPage;


