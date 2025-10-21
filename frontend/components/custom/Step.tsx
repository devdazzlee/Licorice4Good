import React from "react";
import Image from "next/image";

interface StepProps {
  title: string;
  description: string;
  image: string;
  image2?: string;
  className?: string;
}

const Step = ({ title, description, image, image2, className }: StepProps) => {
  return (
    <div className={`flex flex-col items-start justify-center h-2xl py-10 relative  ${className}`}>
      <Image
        src={image}
        alt={"row"}
        width={95}
        height={100}
        className={`absolute bottom-25 right-0 z-10 ${className}`}
      />
      <h1 className="text-16 font-bold text-black">{title}</h1>
      <p className="text-16 font-inter font-medium max-w-10/12 md:max-w-md relative z-10 text-black/40 text-left">
        {description}
      </p>
      {image2 && (
        <Image
          src={image2}
          alt={"Ellipse"}
          width={500} 
          height={500}
        />
      )}
    </div>
  );
};

export default Step;
