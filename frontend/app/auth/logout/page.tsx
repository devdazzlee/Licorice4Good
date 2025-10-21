'use client'
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import AuthCard from '@/components/ui/auth/AuthCard';

const LogoutPage = () => {
  const [status, setStatus] = useState('Logging out...');
  const [storeError, setStoreError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const doLogout = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
        setStatus('Logged out successfully.');
        setTimeout(() => router.replace('/'), 600);
      } catch (e: unknown) {
        setStatus('');
        setStoreError((e as Error)?.message || 'Logout failed');
      }
    };
    doLogout();
  }, [router]);

  return (
    <AuthCard title="Logging out" subtitle="We\'re ending your session" footer={null}>
      <div className="text-center">
        {status && <div className="text-black mb-2">{status}</div>}
        {storeError && <div className="text-red-500">{storeError}</div>}
        <button
          onClick={() => router.replace('/')}
          className="mt-4 bg-primary text-white font-semibold py-2 px-4 rounded hover:bg-orange-600 transition-colors"
        >
          Go home
        </button>
      </div>
    </AuthCard>
  );
};

export default LogoutPage;


