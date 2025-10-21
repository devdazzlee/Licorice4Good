import React from "react";
import Image from "next/image";
import Link from "next/link";
import BlogCard from "@/components/ui/blogs/BlogCard";
import BlogHeader from "@/components/shared/BlogHeader";
import { blogPageData, BlogItem } from "@/constant/blogData";

interface BlogLayoutProps {
  pageTitle: string;
  breadcrumbText: string;
  blogData: BlogItem[];
  currentBlogId?: string; // Optional: ID of the currently open blog
}

const BlogLayout = ({
  pageTitle,
  breadcrumbText,
  blogData,
  currentBlogId,
}: BlogLayoutProps) => {
  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const truncateTitle = (title: string, maxLength: number = 60) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + "...";
  };

  // Filter out the current blog from sidebar
  const sidebarBlogs = blogPageData.blogData.filter(
    (blog) => blog.id !== currentBlogId
  );
  return (
    <section className="bg-white min-h-screen">
      <BlogHeader pageTitle={pageTitle} breadcrumbText={breadcrumbText} />
      <div className="layout py-8">
        {/* Main Content Area - Grid Layout with Blog Cards Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Blog Content - Takes 2/3 of the space on large screens */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {blogData.map((item, index) => {
              return (
                <BlogCard
                  key={index}
                  id={item.id}
                  title={item.title}
                  description={item.description}
                  image={item.image}
                  date={item.date}
                  author={item.author}
                  wrapper={item.wrapper}
                  content={item.content}
                />
              );
            })}
          </div>

          {/* Blog Cards Sidebar - Takes 1/3 of the space on large screens */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="sticky top-6">
              <h3 className="text-xl font-bold text-black mb-4">
                Recent Posts
              </h3>
              {sidebarBlogs.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {sidebarBlogs.map((blog) => {
                    return (
                      <div
                        key={blog.id}
                        className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100"
                      >
                        {/* Blog Image */}
                        <div className="relative h-32 overflow-hidden">
                          <Image
                            src={blog.image}
                            alt={blog.title}
                            width={300}
                            height={200}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        {/* Blog Content */}
                        <div className="p-4">
                          {/* Author */}
                          <div className="flex items-center gap-2 mb-2">
                            <Image
                              src="/assets/images/blogRG.png"
                              alt="author"
                              width={20}
                              height={20}
                              className="rounded-full"
                            />
                            <span className="text-xs text-gray-600 font-medium">
                              {blog.author}
                            </span>
                          </div>

                          {/* Title */}
                          <h4 className="text-sm font-bold text-black mb-2">
                            {truncateTitle(blog.title, 50)}
                          </h4>

                          {/* Description */}
                          <p className="text-gray-600 text-xs leading-relaxed mb-3">
                            {truncateText(blog.description, 100)}
                          </p>

                          {/* Read More Link */}
                          <Link
                            href={`/blogs/${blog.id}`}
                            className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-700 transition-colors duration-200"
                          >
                            <span>Read More</span>
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">
                    No other posts available
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogLayout;
