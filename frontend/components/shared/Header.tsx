"use client";
import { navLinks } from "@/constant/index";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useRef, useEffect } from "react";
import { ShoppingCart, Menu, X, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { useCartStore } from "@/store/cartStore";
import axios from "axios";
import { useWishlistStore } from "@/store/wishlistStore";

// Define types for navLinks and subLinks
type SubLink = {
  label: string;
  href?: string;
};

type NavLink = {
  label: string;
  href?: string;
  navLinks?: SubLink[];
};

const Header = () => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const { user, loading, error, clearUser } = useUser();
  const { getItemCount } = useCartStore();
  const { getItemCount: getWishlistItemCount } = useWishlistStore();
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState<string | null>(
    null
  );
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
      clearUser(); // Clear user state immediately
      window.location.reload();
    } catch (err) {
      console.error("Logout failed:", err);
      // Even if logout fails, clear local state
      clearUser();
      window.location.reload();
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      Object.keys(dropdownRefs.current).forEach((key) => {
        const ref = dropdownRefs.current[key];
        if (ref && !ref.contains(event.target as Node)) {
          setOpenDropdown(null);
        }
      });
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Prevent body scroll when mobile nav is open
  useEffect(() => {
    if (mobileNavOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen]);

  if (loading) return null;

  return (
    <header className="w-full h-24 bg-primary z-50">
      <div className="layout">
        {/* Main header flex: logo left, nav center, actions right */}
        <div className="flex h-full items-center justify-between py-3 w-full">
          {/* Logo - left */}
          <div className="flex-shrink-0">
            <Link href="/" className="block">
              <Image
                src="/assets/svg/logo.svg"
                alt="logo"
                width={140}
                height={48}
                className="object-contain"
                priority
              />
            </Link>
          </div>
          {/* Nav Links - center (hidden on mobile) */}
          <nav className="hidden lg:flex items-center justify-start bg- gap-6 xl:gap-10 ml-6">
            {(navLinks as NavLink[])
              .filter((link) => {
                if (
                  link.href?.startsWith("/dashboard") &&
                  (!user || user.role !== "admin")
                ) {
                  return false;
                }
                return true;
              })
              .map((link) =>
                link.navLinks && Array.isArray(link.navLinks) ? (
                  <div
                    key={link.label}
                    className="relative group"
                    ref={(el) => {
                      dropdownRefs.current[link.label] = el;
                    }}
                  >
                    <button
                      type="button"
                      className="text-base xl:text-lg font-poppins flex items-center gap-1 px-2 py-1 rounded transition cursor-pointer"
                      onClick={() =>
                        setOpenDropdown(
                          openDropdown === link.label ? null : link.label
                        )
                      }
                      onMouseEnter={() => setOpenDropdown(link.label)}
                      onMouseLeave={() => setOpenDropdown(null)}
                    >
                      {link.label}
                      <svg
                        className="w-4 h-4 ml-1"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {/* Dropdown */}
                    <div
                      className={`absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 transition-all duration-150 ${
                        openDropdown === link.label ? "block" : "hidden"
                      }`}
                      onMouseEnter={() => setOpenDropdown(link.label)}
                      onMouseLeave={() => setOpenDropdown(null)}
                    >
                      {link.navLinks.map((sub: SubLink) => (
                        <Link
                          href={sub.href ?? "/"}
                          key={sub.label}
                          className="block px-4 py-2 text-gray-800 transition"
                          onClick={() => setOpenDropdown(null)}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    href={link.href ?? "/"}
                    key={link.label}
                    className="text-base xl:text-lg font-poppins px-2 py-1 rounded transition"
                  >
                    {link.label}
                  </Link>
                )
              )}
            {user?.role === "admin" && (
              <Link
                href="/dashboard/admin"
                className="text-base xl:text-lg font-poppins px-2 py-1 rounded transition"
              >
                Dashboard
              </Link>
            )}
          </nav>
          {/* Actions - right */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {error && (
              <div
                className="text-xs text-orange-500 bg-orange-50 px-2 py-1 rounded"
                title={error}
              >
                ⚠️ Rate limited
              </div>
            )}
            <Link
              href={"/cart"}
              className="relative p-2 rounded transition cursor-pointer"
            >
              <ShoppingCart className="w-6 h-6" />
              {getItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FF5D39] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {getItemCount() > 99 ? "99+" : getItemCount()}
                </span>
              )}
            </Link>
            <Link
              href="/wishlist"
              className="relative p-2 rounded transition cursor-pointer"
            >
              <Heart className="w-6 h-6" />
              {getWishlistItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FF5D39] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold z-10">
                  {getWishlistItemCount() > 99 ? "99+" : getWishlistItemCount()}
                </span>
              )}
            </Link>
            {/* Removed login/profile buttons - only needed for dashboard access */}
            {/* Mobile Nav Toggle */}
            <button
              className="lg:hidden ml-2 p-2 rounded focus:outline-none focus:ring-2 focus:ring-gray-300"
              aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileNavOpen((prev) => !prev)}
            >
              {mobileNavOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
        {/* Mobile Nav */}
        {/* Overlay for mobile nav */}
        <div
          className={`fixed inset-0 z-40 bg-black/65 bg-opacity-40 transition-opacity duration-200 ${
            mobileNavOpen ? "block" : "hidden"
          } lg:hidden`}
          onClick={() => setMobileNavOpen(false)}
        />
        <div
          className={`fixed top-0 right-0 z-50 h-full w-4/5 max-w-xs bg-primary shadow-lg transform transition-transform duration-300 ease-in-out
            ${
              mobileNavOpen ? "translate-x-0" : "translate-x-full"
            } lg:hidden flex flex-col`}
          style={{ minHeight: "100vh" }}
        >
          <div className="flex items-center justify-between w-full px-4 py-4 border-b border-gray-200">
            <Link href="/" onClick={() => setMobileNavOpen(false)}>
              <Image
                src="/assets/svg/logo.svg"
                alt="logo"
                width={120}
                height={40}
                className="object-contain"
                priority
              />
            </Link>
            <button
              className="p-2 rounded focus:outline-none focus:ring-2 focus:ring-gray-300"
              aria-label="Close menu"
              onClick={() => setMobileNavOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          {/* Cart icon and login/logout button for mobile only */}
          <nav className="flex flex-col items-start gap-2 mt-4 w-full px-2">
            {(navLinks as NavLink[])
              .filter((link) => {
                if (
                  link.href?.startsWith("/dashboard") &&
                  (!user || user.role !== "admin")
                ) {
                  return false;
                }
                return true;
              })
              .map((link) =>
                link.navLinks && Array.isArray(link.navLinks) ? (
                  <div key={link.label} className="w-full">
                    <button
                      className="flex items-center justify-between w-full text-base font-poppins py-2 px-2 border-b border-gray-200"
                      onClick={() =>
                        setMobileDropdownOpen(
                          mobileDropdownOpen === link.label ? null : link.label
                        )
                      }
                    >
                      {link.label}
                      <svg
                        className={`w-4 h-4 ml-1 transition-transform ${
                          mobileDropdownOpen === link.label ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {mobileDropdownOpen === link.label && (
                      <div className="flex flex-col w-full bg-gray-50 rounded-b-md">
                        {link.navLinks.map((sub: SubLink) => (
                          <Link
                            href={sub.href ?? "/"}
                            key={sub.label}
                            className="block px-6 py-2 text-gray-800 hover:bg-gray-100 text-left"
                            onClick={() => setMobileNavOpen(false)}
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={link.href ?? "/"}
                    key={link.label}
                    className="text-base font-poppins w-full text-left px-2 py-2 border-b border-gray-200"
                    onClick={() => setMobileNavOpen(false)}
                  >
                    {link.label}
                  </Link>
                )
              )}
            {/* Removed profile and login/logout from mobile nav - only needed for dashboard */}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
