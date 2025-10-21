import CustomButton from "@/components/custom/CustomButton";
import AnimatedText from "@/components/custom/AnimatedText";
import React from "react";
import AnimatedSection from "@/components/custom/AnimatedSection";



const Rope = () => {
  return (
    <section className="w-full min-h-full flex flex-col items-center justify-center py-8 md:py-12 lg:py-16 px-4 md:px-8 bg-secondary">
      <AnimatedSection
        animationType="slideUp"
        duration={0.5}
        className="w-full flex flex-col items-center justify-center relative gap-6 md:gap-8 lg:gap-10 layout"
      >
        <AnimatedText
          text="Rope-candy flavors that make tastebuds tango"
          className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold text-center max-w-4xl text-white leading-tight"
          splitBy="word"
        />
        <p className="text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl text-white text-center w-full md:w-3/4 lg:w-1/2 leading-relaxed">
          Our Traditional, sweet, and sour flavors bring joy to all who try
          them. Orders are packaged fresh and shipped directly from the South
          anywhere in the U.S.
        </p>
        <CustomButton
          className="font-bold text-white w-full md:w-auto px-8 py-3 md:py-4 mt-4 rounded-full text-[14px] md:text-[16px] !bg-[#FF5D39] hover:!bg-[#e04c2a] transition-colors"
          aria-label="Explore our licorice flavors"
          title="Explore Flavors"
          href="/shop"
        />
      </AnimatedSection>
    </section>
  );
};

export default Rope;
