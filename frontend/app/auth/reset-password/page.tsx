"use client"
import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import AuthCard from '@/components/ui/auth/AuthCard';
import PasswordInput from '@/components/ui/auth/PasswordInput';

export const dynamic = 'force-dynamic';

const ResetPasswordContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [form, setForm] = useState({
    password: '',
    confirmPassword: '',
  });
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendMsg, setResendMsg] = useState('');
  const [resending, setResending] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const codeParam = searchParams.get('code') || '';
    const emailParam = searchParams.get('email') || '';
    if (codeParam) setCode(codeParam);
    if (emailParam) setEmail(emailParam);
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
    // no-op
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!code || !form.password || !form.confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      await axios.post(`${API_URL}/auth/reset-password`, { code, password: form.password, email: email || undefined }, { withCredentials: true });
      setSuccess('Password reset successful!');
      setTimeout(() => {
        router.push('/auth/login');
      }, 800);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const serverMsg = (err.response?.data as { message?: string } | undefined)?.message;
        if (serverMsg) {
          setError(serverMsg);
        } else if (status === 400) {
          setError('Invalid or expired code');
        } else {
          setError('Reset failed. Please try again.');
        }
      } else {
        const message = err instanceof Error ? err.message : 'Reset failed.';
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setSuccess('');
    setResendMsg('');
    // no-op
    const normalizedEmail = (email || '').trim().toLowerCase();
    if (!normalizedEmail) {
      setError('Missing email. Go back and enter your email.');
      return;
    }
    try {
      setResending(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      await axios.post(`${API_URL}/auth/forgot-password`, { email: normalizedEmail }, { withCredentials: true });
      setResendMsg(`A new 6-digit code has been sent to ${normalizedEmail}.`);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const serverMsg = (err.response?.data as { message?: string } | undefined)?.message;
        setError(serverMsg || 'Unable to resend code. Please try again.');
      } else {
        const message = err instanceof Error ? err.message : 'Unable to resend code.';
        setError(message);
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthCard
      title="Reset your password"
      subtitle="Enter the token and choose a new password"
      footer={<Link href="/auth/login" className="text-primary hover:underline">Back to login</Link>}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}
        {success && <div className="text-green-600 text-sm text-center">{success}</div>}
        {resendMsg && <div className="text-green-600 text-sm text-center">{resendMsg}</div>}

        <div className="flex flex-col gap-1">
          <label htmlFor="code" className="text-black font-medium">6-digit code</label>
          <input
            id="code"
            name="code"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-black placeholder-gray-400 bg-white tracking-widest text-center"
            placeholder="••••••"
            required
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleResend}
            className="text-sm text-primary hover:underline disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={resending}
          >
            {resending ? 'Resending...' : 'Resend code'}
          </button>
        </div>

        <PasswordInput
          id="password"
          name="password"
          label="New Password"
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
          {loading ? 'Resetting...' : 'Reset password'}
        </button>
      </form>
    </AuthCard>
  );
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-6 text-black">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}


