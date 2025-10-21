"use client";

import React, { useState } from "react";
import CustomButton from "@/components/custom/CustomButton";
import AnimatedText from "@/components/custom/AnimatedText";
import AnimatedSection from "@/components/custom/AnimatedSection";


const Fundraising = () => {
  const [participants, setParticipants] = useState(10);

  // Calculate fundraising amount based on participants
  const calculateAmount = (participants: number) => {
    // $100 per seller over 4 days
    return participants * 180;
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParticipants(parseInt(e.target.value));
  };

  return (
    <section className="w-full min-h-full flex flex-col items-center justify-center relative py-8 md:py-20 px-4 md:px-8 bg-white">
      <div className="absolute inset-0 w-full h-full z-0 bg-[url('/assets/images/fundbg.png')] bg-cover bg-center bg-no-repeat"></div>

      <AnimatedSection
        animationType="slideUp"
        duration={0.5}
        delay={0.2}
        className="h-full w-full layout"
      >
        <AnimatedText
          text="Imagine what you could raise"
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-black text-center"
          splitBy="word"
          duration={0.6}
          stagger={0.1}
          triggerStart="top 80%"
        />
        <AnimatedText
          text="How many sellers do you expect to participate?"
          className="text-lg md:text-xl lg:text-2xl font-medium text-black/30 py-4 md:py-6 text-center px-4"
          splitBy="word"
          duration={0.6}
          stagger={0.1}
          triggerStart="top 80%"
        />
        <div className="w-full flex items-center justify-center gap-4 md:gap-8 mb-6 md:mb-8 px-4">
          <div className="text-xl md:text-2xl lg:text-3xl text-white">1</div>

          <div className="w-full max-w-md md:w-1/3 lg:w-1/4">
            <div className="relative w-full h-12">
              <input
                id="participants-slider"
                type="range"
                min="1"
                max="100"
                value={participants}
                onChange={handleSliderChange}
                aria-label="Select number of participants for fundraising calculation"
                aria-describedby="participants-value"
                className="w-full h-8 md:h-10 bg-white/30 rounded-full appearance-none cursor-pointer slider"
              />
              {/* Dynamic number display that follows the slider */}
              <div
                id="participants-value"
                className="absolute top-14 md:top-16 transform -translate-x-1/2 text-base md:text-lg font-bold text-gray-800 pointer-events-none"
                style={{
                  left: `${((participants - 1) / 99) * 100}%`,
                }}
                aria-live="polite"
                aria-atomic="true"
              >
                {participants}
              </div>
            </div>
          </div>

          <div className="text-xl md:text-2xl lg:text-3xl text-white">100</div>
        </div>
        <div className="w-full flex flex-col items-center justify-center py-3 px-4">
          <h2 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-black w-full md:w-3/4 lg:w-1/2 text-center">
            You could raise about
          </h2>
          <h2 className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-bold text-black py-2">
            ${calculateAmount(participants).toLocaleString()}
          </h2>
          <h5 className="text-xs md:text-sm lg:text-base font-medium text-black/30 w-full md:w-3/4 lg:w-1/2 text-center px-2">
            Sellers typically raise $100 over a four day fundraiser
          </h5>
          <CustomButton
            title="Get Started Now"
            className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4 mt-4 md:mt-6 lg:mt-8"
                // onClick={() => {
                //   router.push("/coming-soon");
                // }}
                href="/coming-soon"
          />
        </div>
      </AnimatedSection>
    </section>
  );
};

export default Fundraising;
