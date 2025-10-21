import React from "react";
import Link from "next/link";

const NotFound = () => {
  return (
    <section className="bg-white min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
          404
        </h1>
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-600 mb-4">
          Blog Not Found
        </h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          The blog post you&apos;re looking for doesn&apos;t exist. Please check the URL or return to the blog listing.
        </p>
        <Link 
          href="/blogs"
          className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
        >
          Back to Blogs
        </Link>
      </div>
    </section>
  );
};

export default NotFound; 