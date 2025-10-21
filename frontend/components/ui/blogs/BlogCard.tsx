"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import AnimatedText from "@/components/custom/AnimatedText";

interface BlogCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  date: string;
  author: string;
  wrapper?: boolean;
  content?: {
    sections?: Array<{
      title: string;
      content: string | string[];
      image?: string;
    }>;
    table?: {
      title: string;
      headers: string[];
      rows: string[][];
    };
    list?: Array<{
      title: string;
      content: string;
    }>;
  };
}

const BlogCard = ({
  id,
  title,
  description,
  image,
  date,
  author,
  wrapper,
  content,
}: BlogCardProps) => {
  const renderContent = () => {
    if (!content) return null;

    return (
      <div className="space-y-6">
        {/* Render Sections */}
        {content.sections &&
          content.sections.map((section, index) => (
            <div key={index} className="space-y-4">
              <h3 className="text-xl md:text-2xl font-semibold text-black">
                {section.title}
              </h3>
              {section.image && (
                <Image
                  src={section.image}
                  alt={section.title}
                  width={1000}
                  height={1000}
                  className="rounded-lg w-full h-auto"
                />
              )}
              <div className="text-sm text-[#555555] font-light leading-6">
                {Array.isArray(section.content) ? (
                  <div className="space-y-2">
                    {section.content.map((paragraph, pIndex) => (
                      <p
                        key={pIndex}
                        dangerouslySetInnerHTML={{ __html: paragraph }}
                      />
                    ))}
                  </div>
                ) : (
                  <p dangerouslySetInnerHTML={{ __html: section.content }} />
                )}
              </div>
            </div>
          ))}

        {/* Render Table */}
        {content.table && (
          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-semibold text-black">
              {content.table.title}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    {content.table.headers.map((header, index) => (
                      <th
                        key={index}
                        className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {content.table.rows.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="border border-gray-300 px-4 py-2 text-sm text-gray-600"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Render List */}
        {content.list && (
          <div className="space-y-4">
            {content.list.map((item, index) => (
              <div key={index} className="space-y-2">
                <h4 className="text-lg md:text-xl font-semibold text-black">
                  {index + 1}. {item.title}
                </h4>
                <p className="text-sm text-[#555555] font-light leading-6">
                  {item.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 rounded-lg ">
      <Link href={`/blogs/${id}`} className="cursor-pointer">
        <Image
          src={image}
          alt="blog"
          width={1000}
          height={1000}
          className="rounded-lg w-full h-auto hover:opacity-90 transition-opacity"
        />
      </Link>
      {wrapper && (
        <div className="flex justify-self-end items-center gap-4 border-b-1 border-black/10 pb-4">
          <AnimatedText
            text={date}
            className="text-sm text-black font-regular"
            splitBy="character"
            duration={0.1}
            stagger={0.01}
            triggerStart="top top"
          />
          <hr className="w-2 h-1 bg-black" />
          <Image
            src="/assets/images/blogRG.png"
            alt="blog"
            width={25}
            height={40}
            className="rounded-lg"
          />
          <p className="text-sm text-black font-light uppercase">{author}</p>
        </div>
      )}
      <AnimatedText
        text={title}
        className="text-2xl md:text-3xl lg:text-4xl font-semibold text-black"
        splitBy="word"
        duration={0.5}
        stagger={0.08}
        triggerStart="top 85%"
      />
      <p className="text-sm text-[#555555] font-light leading-6">
        {description}
      </p>

      {/* Render rich content */}
      {renderContent()}
    </div>
  );
};

export default BlogCard;
