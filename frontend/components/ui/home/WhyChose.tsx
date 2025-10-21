"use client";
import Image from "next/image";
import React from "react";
import AnimatedText from "../../custom/AnimatedText";
import AnimatedSection from "@/components/custom/AnimatedSection";

const list = [
  {
    description: "50% of Every Sale Goes to You",
  },
  {
    description: "No Upfront Costs or Minimum Orders",
  },
  {
    description: "Sample Box Provided for Free",
  },
  {
    description: "Premium Sweets in popular flavor",
  },
];

const WhyChose = () => {

  return (
    <section className="h-fit w-full bg-[url('/assets/images/3bg.png')] bg-cover bg-no-repeat bg-center bg-fixed flex items-center justify-center px-4 md:px-8 py-10 md:py-20">
      <AnimatedSection 
        animationType="slideUp"
        duration={0.5}
        delay={0.2}
        className="w-full flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-12 lg:gap-16 max-w-7xl mx-auto"
      >
        {/* Image Section */}
        <div className="w-full lg:w-1/2 flex items-center justify-center mb-8 lg:mb-0">
          <Image
            src="/assets/images/mobile.png"
            alt="why"
            width={400}
            height={400}
            className="w-full max-w-xs md:max-w-md lg:max-w-lg h-auto object-contain hover:scale-105 transition-all duration-1000 ease-out hover:rotate-6"
          />
        </div>
        {/* Content Section */}
        <div className="w-full lg:w-1/2 flex flex-col items-start justify-start gap-6">
          <AnimatedText
            text="Why Choose Us for Your Next Fundraiser?"
            className="text-3xl md:text-5xl lg:text-6xl font-inter font-bold max-w-full md:max-w-2xl relative z-10 text-white"
            splitBy="word"
            duration={0.3}
            stagger={0.1}
          />
          <ul className="flex flex-col items-start justify-start gap-3 md:gap-4 w-full list-disc list-inside">
            {list.map((item, index) => (
              <li
                key={index}
                className="text-white text-base md:text-lg font-medium leading-relaxed"
              >
                {item.description}
              </li>
            ))}
          </ul>
          {/* Stats Section */}
          <div
            className="w-full flex flex-col sm:flex-row items-center justify-between gap-8 py-10"
          >
            <div className="flex flex-col items-center sm:items-start justify-start gap-2 w-full sm:w-1/2">
              <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-inter font-bold">
                120K
              </h1>
              <h6 className="text-white text-base md:text-lg font-medium leading-relaxed">
                Organizations
              </h6>
            </div>
            <div className="flex flex-col items-center sm:items-start justify-start gap-2 w-full sm:w-1/2">
              <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-inter font-bold">
                8.990
              </h1>
              <h6 className="text-white text-base md:text-lg font-medium leading-relaxed">
                Project Done
              </h6>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </section>
  );
};

export default WhyChose;
