import Fundraising from "@/components/ui/home/Fundraising";
// import ProcessSteps from "@/components/custom/ProcessStep";
import HowItWorks from "@/components/ui/home/HowItWorks";
import ShopOur from "@/components/ui/home/ShopOur";
import WhoWeAre from "@/components/ui/home/WhoWeAre";
import WhyChose from "@/components/ui/home/WhyChose";
import React from "react";


const home = () => {
  return (
    <>
      <Fundraising/>
      <HowItWorks/>
      {/* <ProcessSteps/> */}
      <WhyChose/>
      <WhoWeAre/>
      <ShopOur/>
    </>
  );
};

export default home;  