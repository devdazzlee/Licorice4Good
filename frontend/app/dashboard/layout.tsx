import React from "react";
import DashboardHeader from "@/components/shared/DashboardHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader />
      <main className="w-full h-full layout py-10">{children}</main>
    </div>
  );
}
