"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import AnimatedText from "@/components/custom/AnimatedText";
import { blogPageData } from "@/constant/blogData";

const BlogMainPage = () => {

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const truncateTitle = (title: string, maxLength: number = 60) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + "...";
  };

  return (
    <section className="bg-white min-h-screen">
      {/* Header */}
      <header className="bg-white py-12">
        <div className="layout">
          <div className="flex flex-col gap-4 text-center">
            <AnimatedText
              text="Our Blog"
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-black"
              splitBy="word"
              duration={0.6}
              stagger={0.1}
              triggerStart="top 90%"
            />
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover insights, tips, and stories about fundraising, youth activities, and community building.
            </p>
          </div>
        </div>
      </header>

      {/* Blog Cards Grid */}
      <div className="layout py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPageData.blogData.map((blog) => {
            return (
              <div
                key={blog.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
              >
                {/* Blog Image */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={blog.image}
                    alt={blog.title}
                    width={400}
                    height={300}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Blog Content */}
                <div className="p-6">
                  {/* Author */}
                  <div className="flex items-center gap-2 mb-4">
                    <Image
                      src="/assets/images/blogRG.png"
                      alt="author"
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                    <span className="text-sm text-gray-600 font-medium">
                      {blog.author}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-black mb-3">
                    {truncateTitle(blog.title)}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {truncateText(blog.description)}
                  </p>

                  {/* Read More Link */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <Link
                      href={`/blogs/${blog.id}`}
                      className="inline-flex items-center gap-2 text-sm font-medium text-black hover:text-orange-600 transition-colors duration-200"
                    >
                      <span>Read More</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-8 border border-orange-100">
            <h3 className="text-2xl font-bold text-black mb-4">
              Ready to Start Your Fundraising Journey?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Join thousands of organizations who have successfully raised funds with our candy fundraising solutions.
            </p>
            <Link
              href="/fundraising"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold px-8 py-3 rounded-xl hover:from-orange-600 hover:to-yellow-600 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <span>Start Fundraising</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogMainPage;
