import Image from "next/image";

import React from "react";
import AnimatedSection from "./AnimatedSection";

interface WhoWeCardProps {
  title: string;
  desc: string;
  className?: string;
  bgColor?: string; // Card background
  shadowColor?: string; // Shadow background
}

const WhoWeCard: React.FC<WhoWeCardProps> = ({
  title,
  desc,
  className,
  bgColor = "bg-[#F1A900]",
  shadowColor,
}) => {
  // If no shadowColor is provided, use the same as bgColor
  const shadow = shadowColor || bgColor;

  return (
    <AnimatedSection
      animationType="slideRight"
      duration={0.5}
      delay={0.2}
      stagger={0.1}
      staggerDirection="left"
      className={`relative w-64 sm:w-72 md:w-80 lg:w-96 xl:w-[420px] ${className ? className : ""}`}
    >
      <div
        className={`absolute top-2 sm:top-3 left-2 sm:left-3 w-full h-full rounded-xl sm:rounded-2xl z-0 ${shadow}`}
      ></div>
      <div
        className={`relative flex flex-col items-start justify-start w-full rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 z-10 ${bgColor}`}
      >
        <div className="w-12 sm:w-16 md:w-20 lg:w-24 mb-3 sm:mb-4 md:mb-5">
          <Image
            src="/assets/svg/logo.svg"
            alt="Southern Sweet & Sour Logo"
            width={100}
            height={10}
            className="w-full h-full object-contain"
          />
        </div>
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2 sm:mb-3 md:mb-4 leading-tight">
          {title}
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-white leading-relaxed">
          {desc}
        </p>
      </div>
    </AnimatedSection>
  );
};

export default WhoWeCard;
