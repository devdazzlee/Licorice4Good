import React from "react";
import WhoWeCard from "../../custom/WhoWeCard";
import Image from "next/image";
import CustomButton from "../../custom/CustomButton";
import AnimatedText from "@/components/custom/AnimatedText";
import AnimatedSection from "@/components/custom/AnimatedSection";

const WhoWeAre = () => {
  return (
    <section className="h-full w-full flex flex-col items-center justify-center bg-white py-6 sm:py-8 md:py-12 lg:py-16 px-4">
      <AnimatedText
        text="Who We Are"
        stagger={0.1}
        className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-black text-center mb-4 sm:mb-6 md:mb-8 lg:mb-10"
        splitBy="word"
      />
      <div  className="layout flex flex-col xl:flex-row items-center justify-between w-full gap-6 sm:gap-8 lg:gap-12 xl:gap-4">
       <div className="h-full w-full flex flex-col justify-center items-center gap-6 sm:gap-8 md:gap-10 lg:gap-12 xl:gap-16">
          <WhoWeCard
            title="Fundraising Made Easy"
            desc="We’ve simplified the fundraising process 
            so anyone can succeed. With no fees, no minimum 
            orders, and 50% of every sale going to your cause, 
            our program is designed to remove the stress and maximize your results."
            bgColor="bg-[#F1A900]"
            shadowColor="bg-[#FEE2A1]"
          />
          <WhoWeCard
            title="Deliciously Unique Product"
            desc="Our Southern Sweet & Sour 
            Licorice Ropes are a hit with both kids and 
            adults. We carefully package our top flavors to 
            make selling easy — supporters love them, and 
            participants feel confident sharing something they enjoy."
            bgColor="bg-[#FF5D39]"
            shadowColor="bg-[#FFBEAF]"
          />
        </div>
        <div className="h-full w-full relative flex flex-col items-center justify-center gap-3 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-10 mt-4 sm:mt-6 md:mt-16 lg:mt-20 xl:mt-36">
          <AnimatedSection
            animationType="slideUp"
            duration={0.5}
            delay={0.2}
            stagger={0.1}
            staggerDirection="up"
            className="bg-[#00B2AA] rounded-lg h-[200px] w-[160px] sm:h-[250px] sm:w-[200px] md:h-[300px] md:w-[240px] lg:h-[400px] lg:w-[320px] 
            xl:h-[475px] xl:w-[368px] relative mt-8 sm:mt-12 md:mt-16 lg:mt-0 mb-2 sm:mb-4 md:mb-6 lg:mb-8 xl:mb-10 
          transition-transform duration-500 ease-in-out cursor-pointer hover-moved flex items-start"
          >
            <Image
              src="/assets/images/girl.png"
              alt="who-we-are"
              width={368}
              height={475}
              className="absolute bottom-0 left-0 object-cover"
            />
          </AnimatedSection>
          <CustomButton
            title="Start Fundraiser"
            className="mt-2 sm:mt-4 md:mt-6 lg:mt-8 xl:mt-[92px]"
            href="/fundraising"
          />
        </div>
        <div className="h-full w-full flex flex-col justify-center items-center gap-6 sm:gap-8 md:gap-10 lg:gap-12 xl:gap-16">
          <WhoWeCard
            title="Rooted in Real Experience"
            desc="Our founders grew up doing 
            traditional fundraisers. With 6 kids, 
            they've experienced just about everything. 
            After a career in the Army and gaining experience 
            selling concessions, they created Licorice 4 Good 
            to offer a smarter, tastier way to raise funds."
            bgColor="bg-[#FF5D39]"
            shadowColor="bg-[#FFBEAF]"
          />
          <WhoWeCard
            title="Focused on Your Success"
            desc="We're not just about candy — we're 
            about community. We provide free sample boxes, 
            full support, and everything you need to run a 
            successful fundraiser from start to finish. Your 
            success is our mission."
            bgColor="bg-[#F1A900]"
            shadowColor="bg-[#FEE2A1]"
          />
        </div>
      </div>
    </section>
  );
};

export default WhoWeAre;
