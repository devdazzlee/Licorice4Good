"use client";
import React from 'react';

type AuthCardProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

const AuthCard = ({ title, subtitle, children, footer }: AuthCardProps) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-black">{title}</h1>
          {subtitle && (
            <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
          )}
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          {children}
        </div>
        {footer && (
          <div className="mt-4 text-center text-sm text-gray-600">{footer}</div>
        )}
      </div>
    </div>
  );
};

export default AuthCard;


