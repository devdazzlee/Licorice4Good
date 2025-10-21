"use client";
import React from "react";
import Link from "next/link";

interface ButtonProps {
  title: string;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  style?: React.CSSProperties;
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  loading?: boolean;
  loadingText?: string;
}

const CustomButton = ({ 
  title, 
  className, 
  disabled = false, 
  type = "button", 
  style, 
  href, 
  onClick, 
  loading = false, 
  loadingText 
}: ButtonProps) => {
  const isDisabled = disabled || loading;
  const displayText = loading ? (loadingText || "Loading...") : title;

  if (href) {
    return (
      <Link
        href={href}
        className={`inline-flex items-center justify-center bg-secondary text-[14px] md:text-[16px] px-4 py-2 md:px-6 md:py-4 rounded-full text-white cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
        style={style}
        aria-disabled={isDisabled}
      >
        {displayText}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={`bg-secondary 
        text-[14px] md:text-[16px] px-4 py-2 md:px-6 md:py-4 rounded-full text-white cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      style={style}
      onClick={onClick}
    >
      {loading && (
        <div className="inline-flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
        </div>
      )}
      {displayText}
    </button>
  );
};

export default CustomButton;