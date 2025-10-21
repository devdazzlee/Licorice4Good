import AnimatedText from "@/components/custom/AnimatedText";
import AnimatedSection from "@/components/custom/AnimatedSection";
import CustomButton from "@/components/custom/CustomButton";
import Image from "next/image";
import React from "react";

const dedication = () => {
  return (
    <section className="w-full min-h-screen flex flex-col items-center justify-center layout py-8 md:py-12 lg:py-16 px-4 md:px-8">
      <AnimatedSection 
        animationType="slideUp"
        duration={0.5}
        delay={0.2}
        className="w-full flex flex-col items-center justify-center relative gap-6 md:gap-8 lg:gap-10"
      >
        <AnimatedText
          text="Your dedication and drive. Our rope candy."
          className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold text-center max-w-4xl leading-tight"
          splitBy="word"
          duration={0.6}
          stagger={0.1}
          triggerStart="top 80%"
        />
        <p className="text-sm md:text-base lg:text-lg xl:text-xl font-light text-white text-center max-w-4xl py-4 md:py-6 lg:py-8 leading-relaxed">
          Raise funds with our Virtual Store Technology—the easiest way to
          fundraise for teams, school groups and other causes that benefit
          America&apos;s youth. Sell small batch, premium candy and keep 50% of
          every dollar you sell, with no minimums or fees.
        </p>
        <CustomButton
          title="Get Started Now"
          className="font-bold text-white w-[260px] md:w-[260px] lg:w-[260px] px-8 py-3 md:py-4 z-9"
          href="/coming-soon"
        />
        <div className="w-full flex justify-center items-center -mt-8 md:-mt-16 lg:-mt-24">
          <Image
            src="/assets/images/group.png"
            alt="dedication"
            width={1000}
            height={400}
            // className="w-full h-auto max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-4xl object-contain"xs
            // priority
          />
        </div>
      </AnimatedSection>
    </section>
  );
};

export default dedication;
