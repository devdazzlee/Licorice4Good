import React from "react";
import CustomButton from "@/components/custom/CustomButton";
import Image from "next/image";
import AnimatedText from "@/components/custom/AnimatedText";
import AnimatedSection from "@/components/custom/AnimatedSection";


const Fundraising = () => {
  return (
    <section className="layout flex flex-col-reverse md:flex-row items-center justify-center gap-8 md:gap-10 w-full text-white pb-28">
      <AnimatedSection
        className="flex flex-col items-start justify-center w-full md:w-[48%] gap-4 text-white relative"
        animationType="slideLeft"
        duration={0.5}
        delay={0.2}
      >
        <AnimatedText
          text="Fundraising   just  got  sweeter"
          className="font-archivo font-bold text-[2.5rem] sm:text-[3rem] md:text-[3.5rem] lg:text-[4rem] xl:text-[72px] leading-[110%] tracking-[0]"
          splitBy="word"
          duration={0.3}
          stagger={0.1}
        />
        <p className="text-16 font-inter font-medium max-w-full md:max-w-md leading-[150%] tracking-[0] pb-6 sm:pb-16 md:pb-20 relative z-10">
          Sell Southern Sweet & Sour Licorice Ropes and keep 50% of every sale.
          No fees, no minimums, just success.
        </p>
        <div className="flex justify-center sm:block w-full">
          <Image
            src="/assets/images/Arrow.png"
            alt="decorative arrow"
            width={40}
            height={40}
            className="
              w-full max-w-[60px]
              sm:max-w-[90px] md:max-w-[120px] lg:max-w-[150px] h-auto
              sm:absolute sm:bottom-0 sm:left-1/3 sm:-translate-x-0
              md:left-0 md:ml-[260px] md:translate-x-0 md:absolute
              left-1/2 -translate-x-1/2
              rotate-3 z-10 
              mb-2 sm:mb-0 
            "
          />
        </div>
        <div className="mt-3 sm:mt-6 w-full sm:w-auto">
          <CustomButton
            title="Get Started Now"
            className="bg-primary text-white w-full sm:w-auto relative z-10"
            href="/fundraising"
          />
        </div>
      </AnimatedSection>
      <AnimatedSection
        className="flex flex-col items-center md:items-end justify-center w-full md:w-[52%] mb-6 md:mb-0"
        animationType="slideRight"
        duration={0.5}
        delay={0.2}
      >
        <Image
          src="/assets/images/hero.png"
          alt="hero-image"
          width={400}
          height={400}
          className="w-full max-w-[320px] sm:max-w-[400px] md:max-w-[450px] lg:max-w-[500px] h-auto"
        />
      </AnimatedSection>
    </section>
  );
};

export default Fundraising;
