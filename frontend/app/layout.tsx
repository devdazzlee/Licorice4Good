import type { Metadata } from "next";
import { Archivo, Inter } from "next/font/google";
import "@/styles/globals.css";
import { Lenis } from "@/constant/lenis";
import GlobalVerificationCheck from "@/components/auth/GlobalVerificationCheck";
import React from "react";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Licorice4Good - Premium Licorice & Fundraising Made Sweet",
  description:
    "Premium licorice products with a purpose. Shop our curated selection of traditional and sour licorice flavors while supporting meaningful fundraising campaigns. Quality treats that make a difference.",
  keywords: [
    "licorice",
    "candy",
    "fundraising",
    "premium licorice",
    "traditional licorice",
    "sour licorice",
    "sweet treats",
    "online candy shop",
    "charity fundraising",
    "quality confectionery",
  ],
  authors: [{ name: "Licorice4Good Team" }],
  creator: "Licorice4Good",
  publisher: "Licorice4Good",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://licorice4good.com",
    siteName: "Licorice4Good",
    title: "Licorice4Good - Premium Licorice & Fundraising Made Sweet",
    description:
      "Premium licorice products with a purpose. Shop our curated selection of traditional and sour licorice flavors while supporting meaningful fundraising campaigns.",
    images: [
      {
        url: "/assets/images/hero.png",
        width: 1200,
        height: 630,
        alt: "Licorice4Good - Premium Licorice Products",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Licorice4Good - Premium Licorice & Fundraising Made Sweet",
    description:
      "Premium licorice products with a purpose. Quality treats that make a difference.",
    images: ["/assets/images/hero.png"],
    creator: "@licorice4good",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: "#FF5D39",
  colorScheme: "light",
  category: "food",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <Lenis root>
        <body className={`${archivo.variable} ${inter.variable} antialiased`}>
          <GlobalVerificationCheck />
          {children}
        </body>
      </Lenis>
    </html>
  );
}
