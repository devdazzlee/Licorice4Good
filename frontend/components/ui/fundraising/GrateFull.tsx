"use client";
import AnimatedSection from "@/components/custom/AnimatedSection";
import CustomButton from "@/components/custom/CustomButton";
import AnimatedText from "@/components/custom/AnimatedText";
import Image from "next/image";
import React from "react";

const GrateFull = () => {
  return (
    <section className="w-full min-h-screen flex flex-col items-center justify-center">
      <div className="w-full flex flex-col lg:flex-row items-center justify-center layout py-8 md:py-12 lg:py-16 px-4 md:px-8 gap-8 md:gap-12 lg:gap-16">
        <AnimatedSection 
          animationType="slideRight"
          duration={0.6}
          className="w-full lg:w-1/2 flex flex-col items-start justify-center gap-4 md:gap-6"
        >
          <AnimatedText
            text="We're so grateful to the Southern sweet & sour community for making 2025 such a magical journey."
            className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white transition-all duration-500 leading-tight"
            splitBy="word"
            duration={0.4}
            stagger={0.1}
          />
          <h4 className="text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-white w-full transition-all duration-500 leading-relaxed">
            of every dollar you sell supports your cause
          </h4>
          <p className="text-white text-sm md:text-base lg:text-lg xl:text-xl font-light w-full transition-all duration-500 leading-relaxed">
            You keep half of what you sell through our website
            Licorice4good.com, so you reach your goal faster. And there are no
            set-up fees or handling fees
          </p>
          <CustomButton
            title="Get Started Now"
            className="font-bold text-white w-full md:w-auto px-8 py-3 md:py-4 mt-4"
            href="/coming-soon"
          />
        </AnimatedSection>
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center gap-6 md:gap-8">
          <AnimatedSection 
            animationType="slideLeft"
            duration={0.6}
            className="relative overflow-hidden rounded-lg w-full max-w-md lg:max-w-lg xl:max-w-xl"
          >
            <Image
              src="/assets/images/icon.png"
              alt="GrateFull"
              width={500}
              height={500}
              priority
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            />
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

export default GrateFull;
