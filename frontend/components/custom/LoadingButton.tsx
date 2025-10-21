"use client";
import React from "react";

interface LoadingButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  className?: string;
  type?: "button" | "submit" | "reset";
  style?: React.CSSProperties;
}

const LoadingButton = ({
  children,
  onClick,
  disabled = false,
  loading = false,
  loadingText,
  className = "",
  type = "button",
  style,
}: LoadingButtonProps) => {
  const isDisabled = disabled || loading;
  const displayText = loading ? loadingText || "Loading..." : children;

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={`${className} ${
        isDisabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
      }`}
      style={style}
    >
      {loading && (
        <div className="inline-flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
        </div>
      )}
      {displayText}
    </button>
  );
};

export default LoadingButton;
