"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useUser } from "@/hooks/useUser";
import SafeLink from "@/components/custom/SafeLink";
import VerificationGuard from "@/components/auth/VerificationGuard";

type Order = {
  id: string;
  total: number;
  createdAt?: string;
  status: string;
  paymentStatus: string;
};

const Bar = ({ value, label }: { value: number; label: string }) => {
  const height = Math.max(2, Math.min(100, Math.round(value)));
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-6 bg-gradient-to-t from-[#FF5D39] to-[#F1A900] rounded"
        style={{ height: `${height}px` }}
      />
      <span className="text-[10px] text-black/70">{label}</span>
    </div>
  );
};

const DashboardPage = () => {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only redirect if user is loaded and either no user or not an admin
    if (!userLoading && (!user || user.role !== "admin")) {
      router.replace("/");
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    if (user?.role !== "admin") return;
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const controller = new AbortController();
    (async () => {
      setLoading(true);
      setError(null);
      try {
        // Try to fetch a large page of orders for simple analytics
        const { data } = await axios.get<{ orders: Order[] }>(
          `${API_URL}/orders/admin/all`,
          {
            withCredentials: true,
            signal: controller.signal,
            params: { page: 1, limit: 500 },
          }
        );
        const list = Array.isArray(data.orders) ? data.orders : [];
        setOrders(list);
      } catch (e) {
        if (axios.isCancel(e)) return;
        const message =
          (e as { message?: string })?.message || "Failed to load analytics";
        setError(message);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [user]);

  const now = useMemo(() => new Date(), []);

  const totals = useMemo(() => {
    const toDate = (o: Order) => (o.createdAt ? new Date(o.createdAt) : null);
    const isPaid = (o: Order) => o.paymentStatus === "paid";
    const todayKey = now.toISOString().slice(0, 10);
    let daily = 0,
      monthly = 0,
      yearly = 0;
    const monthKey = `${now.getFullYear()}-${now.getMonth()}`;
    const yearKey = `${now.getFullYear()}`;
    for (const o of orders) {
      if (!isPaid(o)) continue;
      const d = toDate(o);
      if (!d) continue;
      const oDay = d.toISOString().slice(0, 10);
      const oMonth = `${d.getFullYear()}-${d.getMonth()}`;
      const oYear = `${d.getFullYear()}`;
      if (oDay === todayKey) daily += Number(o.total || 0);
      if (oMonth === monthKey) monthly += Number(o.total || 0);
      if (oYear === yearKey) yearly += Number(o.total || 0);
    }
    return { daily, monthly, yearly };
  }, [orders, now]);

  const last7Days = useMemo(() => {
    const buckets: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      buckets[key] = 0;
    }
    for (const o of orders) {
      if (o.paymentStatus !== "paid" || !o.createdAt) continue;
      const key = new Date(o.createdAt).toISOString().slice(0, 10);
      if (key in buckets) buckets[key] += Number(o.total || 0);
    }
    const entries = Object.entries(buckets);
    const max = Math.max(1, ...entries.map(([, v]) => v));
    return entries.map(([k, v]) => ({
      label: k.slice(5),
      value: (v / max) * 100,
    }));
  }, [orders, now]);

  const last12Months = useMemo(() => {
    const buckets: Record<string, number> = {};
    const labels: string[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now);
      d.setMonth(now.getMonth() - i);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const label = d.toLocaleString("default", { month: "short" });
      buckets[key] = 0;
      labels.push(label);
    }
    const keys = Object.keys(buckets);
    for (const o of orders) {
      if (o.paymentStatus !== "paid" || !o.createdAt) continue;
      const d = new Date(o.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (key in buckets) buckets[key] += Number(o.total || 0);
    }
    const values = keys.map((k) => buckets[k]);
    const max = Math.max(1, ...values);
    return keys.map((k, i) => ({
      label: labels[i],
      value: (buckets[k] / max) * 100,
    }));
  }, [orders, now]);

  // Show loading state while user is being loaded
  if (userLoading) {
    return (
      <div className="w-full h-full layout py-10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5D39] mx-auto mb-4"></div>
          <p className="text-black text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show access denied if user is loaded but not admin
  if (!userLoading && user && user.role !== "admin") {
    return (
      <div className="w-full h-full layout py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black mb-4">Access Denied</h1>
          <p className="text-black opacity-70 mb-6">You need admin privileges to access this page.</p>
          <Link 
            href="/"
            className="inline-block bg-[#FF5D39] text-white font-bold px-6 py-3 rounded-lg shadow-lg hover:opacity-90 transition-all"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  // Show loading state while auth is being checked
  if (userLoading) {
    return (
      <div className="w-full h-full layout py-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5D39] mx-auto mb-4"></div>
            <p className="text-black opacity-70">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <VerificationGuard>
      <div className="w-full h-full layout py-10">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-black mb-4 sm:mb-6">Dashboard</h1>

      {/* Quick navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <SafeLink
          href="/dashboard/orders"
          className="rounded-2xl border shadow bg-gradient-to-br from-[#FFF2EE] to-white p-4 sm:p-5 hover:shadow-md transition cursor-pointer"
        >
          <div className="text-black/70 text-xs sm:text-sm">Manage</div>
          <div className="text-lg sm:text-xl font-bold text-black">Orders</div>
          <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-black/60">
            View and update order statuses
          </div>
        </SafeLink>
        <SafeLink
          href="/dashboard/admin"
          className="rounded-2xl border shadow bg-gradient-to-br from-[#FFF8E5] to-white p-4 sm:p-5 hover:shadow-md transition cursor-pointer"
        >
          <div className="text-black/70 text-xs sm:text-sm">Manage</div>
          <div className="text-lg sm:text-xl font-bold text-black">Products</div>
          <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-black/60">
            Add, edit, and delete products
          </div>
        </SafeLink>
      </div>

      {error && (
        <div
          className="mb-4 p-3 rounded border"
          style={{
            background: "#FFF4F1",
            borderColor: "#FF5D39",
            color: "#FF5D39",
          }}
        >
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="rounded-2xl border shadow bg-gradient-to-br from-[#FFF2EE] to-white p-4 sm:p-5">
          <div className="text-black/70 text-xs sm:text-sm">Today Revenue</div>
          <div className="mt-1 sm:mt-2 text-2xl sm:text-3xl font-extrabold text-[#FF5D39]">
            ${totals.daily.toFixed(2)}
          </div>
          <div className="mt-1 text-[10px] sm:text-xs text-black/50">Paid orders only</div>
        </div>
        <div className="rounded-2xl border shadow bg-gradient-to-br from-[#FFF8E5] to-white p-4 sm:p-5">
          <div className="text-black/70 text-xs sm:text-sm">This Month</div>
          <div className="mt-1 sm:mt-2 text-2xl sm:text-3xl font-extrabold text-[#F1A900]">
            ${totals.monthly.toFixed(2)}
          </div>
          <div className="mt-1 text-[10px] sm:text-xs text-black/50">Paid orders only</div>
        </div>
        <div className="rounded-2xl border shadow bg-gradient-to-br from-[#F3F4F6] to-white p-4 sm:p-5">
          <div className="text-black/70 text-xs sm:text-sm">This Year</div>
          <div className="mt-1 sm:mt-2 text-2xl sm:text-3xl font-extrabold text-black">
            ${totals.yearly.toFixed(2)}
          </div>
          <div className="mt-1 text-[10px] sm:text-xs text-black/50">Paid orders only</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="rounded-2xl border shadow bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <h2 className="text-base sm:text-lg font-bold text-black">
              Revenue (Last 7 days)
            </h2>
          </div>
          <div className="h-40 sm:h-48 flex items-end gap-1.5 sm:gap-2">
            {last7Days.map((b) => (
              <Bar key={b.label} value={b.value} label={b.label} />
            ))}
          </div>
        </div>
        <div className="rounded-2xl border shadow bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <h2 className="text-base sm:text-lg font-bold text-black">
              Revenue (Last 12 months)
            </h2>
          </div>
          <div className="h-40 sm:h-48 flex items-end gap-1.5 sm:gap-2">
            {last12Months.map((b, i) => (
              <Bar key={`${b.label}-${i}`} value={b.value} label={b.label} />
            ))}
          </div>
        </div>
      </div>

      {loading && <div className="mt-4 sm:mt-6 text-sm sm:text-base text-black">Loading analytics...</div>}
    </div>
    </VerificationGuard>
  );
};

export default DashboardPage;
