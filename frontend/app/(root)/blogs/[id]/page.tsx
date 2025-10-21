import React from "react";
import BlogLayout from "@/components/shared/BlogLayout";
import { getBlogById } from "@/constant/blogData";
import { notFound } from "next/navigation";

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  // Get specific blog data based on ID
  const blog = getBlogById(id);

  // If blog not found, show 404
  if (!blog) {
    notFound();
  }

  const dynamicData = {
    pageTitle: blog.title,
    breadcrumbText: `Blog ${id}`,
    blogData: [blog], // Single blog item
  };

  return (
    <BlogLayout
      pageTitle={dynamicData.pageTitle}
      breadcrumbText={dynamicData.breadcrumbText}
      blogData={dynamicData.blogData}
      currentBlogId={id}
    />
  );
};

// Generate static params for all blog IDs
export async function generateStaticParams() {
  const blogIds = ["1", "2", "3", "4"];

  return blogIds.map((id) => ({
    id: id,
  }));
}

export default Page;
