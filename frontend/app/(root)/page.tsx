"use client";
import React, { useEffect, useState } from "react";
import Home from "./Home/page";
import Lenis from "lenis";
import LoadingScreen from "@/components/custom/LoadingScreen";

const Page = () => {
  // Check localStorage immediately to avoid showing loading animation
  const hasLoadedBefore =
    typeof window !== "undefined"
      ? localStorage.getItem("hasLoadedBefore")
      : null;
  const [isLoading, setIsLoading] = useState(!hasLoadedBefore);
  const [showHome, setShowHome] = useState(!!hasLoadedBefore);

  useEffect(() => {
    const lenis = new Lenis();

    function ref(time: number) {
      lenis.raf(time);
      requestAnimationFrame(ref);
    }
    requestAnimationFrame(ref);

    return () => {
      lenis.destroy();
    };
  }, []);

  // Disable scroll while loading
  useEffect(() => {
    if (isLoading) {
      // Disable scroll
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    } else {
      // Re-enable scroll
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    }

    // Cleanup function
    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, [isLoading]);

  const handleLoadingComplete = () => {
    setIsLoading(false);
    // Mark that loading animation has been shown
    localStorage.setItem("hasLoadedBefore", "true");
    // Faster transition - reduced delay
    setTimeout(() => {
      setShowHome(true);
    }, 100);
  };

  return (
    <>
      {isLoading && <LoadingScreen onComplete={handleLoadingComplete} />}
      <section
        className={`transition-all duration-500 ease-out ${
          showHome ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <Home />
        {/* <ComingSoonPage /> */}
      </section>
    </>
  );
};

export default Page;
