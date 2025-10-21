"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useUser } from "@/hooks/useUser";

interface AnalyticsData {
  todayStats: {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    conversionRate: number;
  };
  hourlyStats: Array<{
    hour: number;
    orders: number;
    revenue: number;
  }>;
  riskStats: {
    autoApproved: number;
    manualReview: number;
    highRisk: number;
    totalProcessed: number;
  };
  topProducts: Array<{
    productName: string;
    quantity: number;
    revenue: number;
  }>;
  paymentStats: {
    paid: number;
    pending: number;
    failed: number;
    retrySuccess: number;
  };
}

const AnalyticsPage = () => {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [selectedTimeRange, setSelectedTimeRange] = useState("today");

  useEffect(() => {
    if (!userLoading && (!user || user.role !== "admin")) {
      router.replace("/");
    }
  }, [user, userLoading, router]);

  const fetchAnalytics = useCallback(async () => {
    if (!user || user.role !== "admin") return;

    try {
      setLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL;

      const params = new URLSearchParams();
      params.set("timeRange", selectedTimeRange);

      const { data } = await axios.get(
        `${API_URL}/analytics/dashboard?${params.toString()}`,
        { withCredentials: true }
      );

      setAnalyticsData(data);
      setError(null);
    } catch (err) {
      console.error("Analytics fetch error:", err);
      setError("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  }, [user, selectedTimeRange]);

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh && user?.role === "admin") {
      const interval = setInterval(fetchAnalytics, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, fetchAnalytics, user]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5D39] mx-auto mb-4"></div>
          <p className="text-black text-lg">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full layout">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-black">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Real-time business intelligence and order monitoring
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-black bg-white"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300"
              />
              Auto-refresh
            </label>
            {autoRefresh && (
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value={15000}>15s</option>
                <option value={30000}>30s</option>
                <option value={60000}>1m</option>
                <option value={300000}>5m</option>
              </select>
            )}
          </div>

          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && !analyticsData && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5D39]"></div>
          <span className="ml-3 text-lg text-gray-600">
            Loading analytics...
          </span>
        </div>
      )}

      {/* Analytics Content */}
      {analyticsData && (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg border p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Orders
                  </p>
                  <p className="text-3xl font-bold text-black">
                    {formatNumber(analyticsData.todayStats.totalOrders)}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Revenue
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {formatCurrency(analyticsData.todayStats.totalRevenue)}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Avg Order Value
                  </p>
                  <p className="text-3xl font-bold text-purple-600">
                    {formatCurrency(analyticsData.todayStats.averageOrderValue)}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Conversion Rate
                  </p>
                  <p className="text-3xl font-bold text-orange-600">
                    {(analyticsData.todayStats.conversionRate * 100).toFixed(1)}
                    %
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Assessment & Payment Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Assessment */}
            <div className="bg-white rounded-lg border p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-black mb-4">
                Automated Risk Assessment
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium">Auto-Approved</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-black">
                      {formatNumber(analyticsData.riskStats.autoApproved)}
                    </span>
                    <p className="text-xs text-gray-500">
                      {(
                        (analyticsData.riskStats.autoApproved /
                          analyticsData.riskStats.totalProcessed) *
                        100
                      ).toFixed(1)}
                      %
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-sm font-medium">Manual Review</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-black">
                      {formatNumber(analyticsData.riskStats.manualReview)}
                    </span>
                    <p className="text-xs text-gray-500">
                      {(
                        (analyticsData.riskStats.manualReview /
                          analyticsData.riskStats.totalProcessed) *
                        100
                      ).toFixed(1)}
                      %
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm font-medium">High Risk</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-black">
                      {formatNumber(analyticsData.riskStats.highRisk)}
                    </span>
                    <p className="text-xs text-gray-500">
                      {(
                        (analyticsData.riskStats.highRisk /
                          analyticsData.riskStats.totalProcessed) *
                        100
                      ).toFixed(1)}
                      %
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      Total Processed
                    </span>
                    <span className="text-lg font-bold text-black">
                      {formatNumber(analyticsData.riskStats.totalProcessed)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Stats */}
            <div className="bg-white rounded-lg border p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-black mb-4">
                Payment Analytics
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium">
                      Successful Payments
                    </span>
                  </div>
                  <span className="text-lg font-bold text-green-600">
                    {formatNumber(analyticsData.paymentStats.paid)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-sm font-medium">
                      Pending Payments
                    </span>
                  </div>
                  <span className="text-lg font-bold text-yellow-600">
                    {formatNumber(analyticsData.paymentStats.pending)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm font-medium">Failed Payments</span>
                  </div>
                  <span className="text-lg font-bold text-red-600">
                    {formatNumber(analyticsData.paymentStats.failed)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm font-medium">Retry Success</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">
                    {formatNumber(analyticsData.paymentStats.retrySuccess)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Hourly Performance Chart */}
          <div className="bg-white rounded-lg border p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-black mb-4">
              Hourly Performance
            </h3>
            <div className="grid grid-cols-12 gap-2 h-40">
              {analyticsData.hourlyStats.map((stat, index) => {
                const maxOrders = Math.max(
                  ...analyticsData.hourlyStats.map((s) => s.orders)
                );
                const height =
                  maxOrders > 0 ? (stat.orders / maxOrders) * 100 : 0;

                return (
                  <div
                    key={index}
                    className="flex flex-col items-center justify-end h-full"
                  >
                    <div
                      className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                      style={{ height: `${height}%` }}
                      title={`Hour ${stat.hour}: ${
                        stat.orders
                      } orders, ${formatCurrency(stat.revenue)}`}
                    ></div>
                    <div className="text-xs text-gray-500 mt-1">
                      {stat.hour.toString().padStart(2, "0")}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-lg border p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-black mb-4">
              Top Performing Products
            </h3>
            <div className="space-y-3">
              {analyticsData.topProducts.map((product, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-black">
                        {product.productName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatNumber(product.quantity)} units sold
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      {formatCurrency(product.revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
