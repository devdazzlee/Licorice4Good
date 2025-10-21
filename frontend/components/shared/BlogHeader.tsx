import React from "react";
import Link from "next/link";
import AnimatedText from "@/components/custom/AnimatedText";

interface BlogHeaderProps {
  pageTitle: string;
  breadcrumbText: string;
}

const BlogHeader = ({ pageTitle, breadcrumbText }: BlogHeaderProps) => {
  return (
    <header className="bg-white py-8">
      <div className="layout">
        <div className="flex flex-col gap-2">
          <AnimatedText
            text={pageTitle}
            className="text-4xl md:text-5xl font-bold text-black"
            splitBy="word"
            duration={0.6}
            stagger={0.1}
            triggerStart="top 90%"
          />
          <nav className="text-sm text-gray-500 font-light">
            <Link
              href="/blog-main"
              className="hover:text-black transition-colors"
            >
              Home
            </Link>
            <span className="mx-2">-</span>
            <span>{breadcrumbText}</span>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default BlogHeader;
