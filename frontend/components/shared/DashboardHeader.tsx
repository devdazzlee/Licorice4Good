"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";
import { useUser } from "@/hooks/useUser";

const NavLink = ({
  href,
  label,
  onClick,
  disabled = false,
}: {
  href: string;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}) => {
  const pathname = usePathname();
  const isActive = pathname.startsWith(href);

  if (disabled) {
    return (
      <span
        className={`block px-3 py-2 rounded-lg text-sm font-medium transition opacity-50 cursor-not-allowed ${
          isActive
            ? "bg-white/15 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.2)]"
            : "text-white/85"
        }`}
      >
        {label}
      </span>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`block px-3 py-2 rounded-lg text-sm font-medium transition ${
        isActive
          ? "bg-white/15 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.2)]"
          : "text-white/85 hover:bg-white/10"
      }`}
    >
      {label}
    </Link>
  );
};

export default function DashboardHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const router = useRouter();
  const { user, clearUser } = useUser();

  // Close menu on navigation
  const handleNavClick = () => setMenuOpen(false);

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
      clearUser(); // Clear user state immediately
      router.push("/"); // Redirect to home page
    } catch (err) {
      console.error("Logout failed:", err);
      // Even if logout fails, clear local state
      clearUser();
      router.push("/");
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <div className="w-full bg-primary sticky top-0 z-30 shadow-sm">
      <div className="h-14 sm:h-16 flex items-center justify-between border-b border-white/10 layout">
        {/* Left: Logo/Title */}
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/admin"
            className="text-lg sm:text-xl font-extrabold text-white drop-shadow"
          >
            <Image
              src="/assets/svg/logo.svg"
              alt="logo"
              width={140}
              height={48}
            />
          </Link>
        </div>

        {/* Hamburger for mobile */}
        <button
          className="sm:hidden flex items-center justify-center p-2 rounded-md text-white hover:bg-white/10 focus:outline-none"
          aria-label="Open menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 8h16M4 16h16"
              />
            )}
          </svg>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden sm:flex items-center gap-1.5 sm:gap-2">
          <NavLink href="/shop" label="Shop" />
          <NavLink href="/dashboard" label="Overview" />
          <NavLink href="/dashboard/orders" label="Orders" />
          <NavLink href="/dashboard/admin" label="Products" />
        </nav>

        {/* Desktop User Actions */}
        <div className="hidden sm:flex items-center gap-2 sm:gap-3">
          <span className="text-xs sm:text-sm text-white/90">
            {user?.name || user?.email || "Admin User"}
          </span>
          <button 
            onClick={handleLogout}
            disabled={logoutLoading}
            className="px-2.5 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm bg-white/15 text-white hover:bg-white/20 transition shadow-[0_0_0_1px_rgba(255,255,255,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {logoutLoading ? "Logging out..." : "Logout"}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="sm:hidden bg-primary border-t border-white/10 px-3 sm:px-4 pb-4">
          <nav className="flex flex-col gap-1 mt-2">
            <NavLink href="/shop" label="Shop" onClick={handleNavClick} />
            <NavLink
              href="/dashboard"
              label="Overview"
              onClick={handleNavClick}
            />
            <NavLink
              href="/dashboard/orders"
              label="Orders"
              onClick={handleNavClick}
            />
            <NavLink
              href="/dashboard/admin"
              label="Products"
              onClick={handleNavClick}
            />
          </nav>
          <div className="flex flex-col gap-2 mt-3">
            <span className="text-xs sm:text-sm text-white/90">
              {user?.name || user?.email || "Admin User"}
            </span>
            <button
              onClick={handleLogout}
              disabled={logoutLoading}
              className="w-full px-3 py-1.5 rounded-md text-xs sm:text-sm bg-white/15 text-white hover:bg-white/20 transition shadow-[0_0_0_1px_rgba(255,255,255,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {logoutLoading ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
