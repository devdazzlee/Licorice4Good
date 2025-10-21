"use client";
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

interface AnimatedTextProps {
  text: string;
  className?: string;
  splitBy?: "word" | "character";
  duration?: number;
  stagger?: number;
  ease?: string;
  triggerStart?: string;
  triggerEnd?: string;
  initialY?: number;
  initialOpacity?: number;
  initialRotateX?: number;
  finalY?: number;
  finalOpacity?: number;
  finalRotateX?: number;
}

const AnimatedText = ({
  text,
  className = "",
  splitBy = "word",
  duration = 0.3,
  stagger = 0.1,
  ease = "back.out(1.7)",
  triggerStart = "top 80%",
  triggerEnd = "bottom 20%",
  initialY = 100,
  initialOpacity = 0,
  initialRotateX = -90,
  finalY = 0,
  finalOpacity = 1,
  finalRotateX = 0,
}: AnimatedTextProps) => {
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const textElement = textRef.current;
    
    if (textElement) {
      const elements = textElement.querySelectorAll(`.${splitBy === "word" ? "word" : "char"}`);
      
      gsap.fromTo(
        elements,
        {
          y: initialY,
          opacity: initialOpacity,
          rotateX: initialRotateX,
        },
        {
          y: finalY,
          opacity: finalOpacity,
          rotateX: finalRotateX,
          duration,
          ease,
          stagger,
          scrollTrigger: {
            trigger: textElement,
            start: triggerStart,
            end: triggerEnd,
            toggleActions: "play none none reverse",
          },
        }
      );
    }

    // Cleanup function
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [
    text,
    splitBy,
    duration,
    stagger,
    ease,
    triggerStart,
    triggerEnd,
    initialY,
    initialOpacity,
    initialRotateX,
    finalY,
    finalOpacity,
    finalRotateX,
  ]);

  const renderText = () => {
    if (splitBy === "word") {
      return text.split(" ").map((word, index) => (
        <span
          key={index}
          className="word inline-block mr-2"
          style={{ transformOrigin: "center bottom" }}
        >
          {word}
        </span>
      ));
    } else {
      return text.split("").map((char, index) => (
        <span
          key={index}
          className="char inline-block"
          style={{ transformOrigin: "center bottom" }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ));
    }
  };

  return (
    <div ref={textRef} className={className}>
      {renderText()}
    </div>
  );
};

export default AnimatedText; 