"use client";
import AnimatedSection from "@/components/custom/AnimatedSection";
import AnimatedText from "@/components/custom/AnimatedText";
import CustomButton from "@/components/custom/CustomButton";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

const Off = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Array of slider content - you can add more images/content here
  const sliderContent = [
    {
      image: "/assets/images/off1.png",
      //   title: "",
      //   subtitle: "",
      //   description: "",
    },
    {
      image: "/assets/images/slider.png",
      //   title: "Easy Setup",
      //   subtitle: "Get started in minutes",
      //   description:
      //     "Simple registration process with no hidden fees. Start your fundraising campaign today and see results quickly.",
    },
    {
      image: "/assets/images/off1.png",
      //   title: "Success Stories",
      //   subtitle: "Real results from real people",
      //   description:
      //     "Join thousands of successful fundraisers who have reached their goals using our platform.",
    },
  ];

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === sliderContent.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? sliderContent.length - 1 : prevIndex - 1
    );
  };



  return (
    <section className="w-full min-h-screen flex flex-col items-center justify-center bg-accent">
      <div className="w-full flex flex-col lg:flex-row items-center justify-center layout py-8 md:py-12 lg:py-16 px-4 md:px-8 gap-8 md:gap-12 lg:gap-16">
        <AnimatedSection 
          animationType="slideLeft"
          duration={0.6}
          className="w-full lg:w-1/2 flex flex-col items-start justify-center gap-4 md:gap-6"
        >
          <AnimatedText
            text={"50%"}
            className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-bold text-white transition-all duration-500 leading-tight"
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
        <AnimatedSection 
          animationType="slideRight"
          duration={0.6}
          className="w-full lg:w-1/2 flex flex-col justify-center items-center gap-6 md:gap-8"
        >
          <div className="relative overflow-hidden rounded-lg w-full max-w-md lg:max-w-lg xl:max-w-xl">
            <Image
              src={sliderContent[currentIndex].image}
              alt={`Slide ${currentIndex + 1}`}
              width={500}
              height={500}
              className="w-full h-auto transition-all duration-500 ease-in-out transform hover:scale-105"
            />
          </div>
          <div className="flex flex-row gap-3 md:gap-4 justify-center mt-4 md:mt-6">
            <button
              onClick={handlePrevious}
              aria-label="Previous slide"
              className="w-10 h-10 md:w-12 md:h-12 bg-secondary rounded-full flex items-center justify-center text-white transition-all duration-300 hover:bg-white hover:text-secondary hover:scale-110"
            >
              <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next slide"
              className="w-10 h-10 md:w-12 md:h-12 bg-secondary rounded-full flex items-center justify-center text-white transition-all duration-300 hover:bg-white hover:text-secondary hover:scale-110"
            >
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" />
            </button>
          </div>
        </AnimatedSection>
      </div>
      <div className="w-full flex justify-center items-center bg-secondary">
        <Image
          src="/assets/images/MaskGroup.png"
          alt="off"
          width={2000}
          height={1000}
          className="w-full h-auto object-contain"
        />
      </div>
    </section>
  );
};

export default Off;
