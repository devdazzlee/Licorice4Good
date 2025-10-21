"use client";
import React, { useEffect, useRef, ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  animationType?: "fadeIn" | "slideUp" | "slideLeft" | "slideRight" | "scaleIn" | "rotateIn" | "custom";
  duration?: number;
  delay?: number;
  ease?: string;
  triggerStart?: string;
  triggerEnd?: string;
  initialY?: number;
  initialX?: number;
  initialOpacity?: number;
  initialScale?: number;
  initialRotate?: number;
  finalY?: number;
  finalX?: number;
  finalOpacity?: number;
  finalScale?: number;
  finalRotate?: number;
  stagger?: number;
  staggerChildren?: boolean;
  staggerDirection?: "up" | "down" | "left" | "right";
  onAnimationStart?: () => void;
  onAnimationComplete?: () => void;
}

const AnimatedSection = ({
  children,
  className = "",
  animationType = "fadeIn",
  duration = 0.8,
  delay = 0,
  ease = "power2.out",
  triggerStart = "top 80%",
  triggerEnd = "bottom 20%",
  initialY = 50,
  initialX = 0,
  initialOpacity = 0,
  initialScale = 1,
  initialRotate = 0,
  finalY = 0,
  finalX = 0,
  finalOpacity = 1,
  finalScale = 1,
  finalRotate = 0,
  stagger = 0.1,
  staggerChildren = false,
  staggerDirection = "up",
  onAnimationStart,
  onAnimationComplete,
}: AnimatedSectionProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sectionElement = sectionRef.current;
    
    if (!sectionElement) return;

    // Set initial state based on animation type
    const getInitialState = () => {
      switch (animationType) {
        case "fadeIn":
          return { opacity: initialOpacity };
        case "slideUp":
          return { y: initialY, opacity: initialOpacity };
        case "slideLeft":
          return { x: -initialX, opacity: initialOpacity };
        case "slideRight":
          return { x: initialX, opacity: initialOpacity };
        case "scaleIn":
          return { scale: initialScale, opacity: initialOpacity };
        case "rotateIn":
          return { rotate: initialRotate, opacity: initialOpacity };
        case "custom":
          return {
            y: initialY,
            x: initialX,
            opacity: initialOpacity,
            scale: initialScale,
            rotate: initialRotate,
          };
        default:
          return { opacity: initialOpacity };
      }
    };

    const getFinalState = () => {
      switch (animationType) {
        case "fadeIn":
          return { opacity: finalOpacity };
        case "slideUp":
          return { y: finalY, opacity: finalOpacity };
        case "slideLeft":
          return { x: finalX, opacity: finalOpacity };
        case "slideRight":
          return { x: finalX, opacity: finalOpacity };
        case "scaleIn":
          return { scale: finalScale, opacity: finalOpacity };
        case "rotateIn":
          return { rotate: finalRotate, opacity: finalOpacity };
        case "custom":
          return {
            y: finalY,
            x: finalX,
            opacity: finalOpacity,
            scale: finalScale,
            rotate: finalRotate,
          };
        default:
          return { opacity: finalOpacity };
      }
    };

    // Handle stagger direction
    const getStaggerDirection = () => {
      switch (staggerDirection) {
        case "up":
          return { y: 30 };
        case "down":
          return { y: -30 };
        case "left":
          return { x: 30 };
        case "right":
          return { x: -30 };
        default:
          return { y: 30 };
      }
    };

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: sectionElement,
        start: triggerStart,
        end: triggerEnd,
        toggleActions: "play none none reverse",
        onEnter: onAnimationStart,
      },
    });

    if (onAnimationComplete) {
      timeline.eventCallback("onComplete", onAnimationComplete);
    }

    if (staggerChildren) {
      // Animate children with stagger
      const children = sectionElement.children;
      const staggerState = getStaggerDirection();
      
      timeline.fromTo(
        children,
        {
          ...getInitialState(),
          ...staggerState,
        },
        {
          ...getFinalState(),
          duration,
          ease,
          stagger,
          delay,
        }
      );
    } else {
      // Animate the entire section
      timeline.fromTo(
        sectionElement,
        getInitialState(),
        {
          ...getFinalState(),
          duration,
          ease,
          delay,
        }
      );
    }

    // Cleanup function
    return () => {
      timeline.kill();
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.trigger === sectionElement) {
          trigger.kill();
        }
      });
    };
  }, [
    animationType,
    duration,
    delay,
    ease,
    triggerStart,
    triggerEnd,
    initialY,
    initialX,
    initialOpacity,
    initialScale,
    initialRotate,
    finalY,
    finalX,
    finalOpacity,
    finalScale,
    finalRotate,
    stagger,
    staggerChildren,
    staggerDirection,
    onAnimationStart,
    onAnimationComplete,
  ]);

  return (
    <div ref={sectionRef} className={className}>
      {children}
    </div>
  );
};

export default AnimatedSection; 