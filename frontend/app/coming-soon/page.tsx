"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";

const ComingSoonPage = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const targetDate = new Date("November 1, 2025 00:00:00").getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
        return;
      }
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const Card = ({ value, label }: { value: string; label: string }) => (
    <div className="bg-[#E0E0E0] rounded-2xl shadow-sm border border-[#00000054] text-black shrink-0 w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-44 lg:h-44 flex flex-col items-center justify-center text-center">
      <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-1 leading-none">
        {value}
      </div>
      <div className="text-[10px] sm:text-xs md:text-sm lg:text-base font-semibold text-gray-600 uppercase tracking-wider">
        {label}
      </div>
    </div>
  );

  return (
    <div className="h-screen w-screen bg-primary overflow-hidden p-3 sm:p-5">
      <div className="h-full w-full rounded-[28px] border border-white/30 bg-[#D9D9D9] backdrop-blur-md shadow-xl overflow-hidden relative">
        {/* Decorative inner glow - top left */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-10 -left-10 w-[55%] h-[55%] rounded-[40px]"
          style={{
            background:
              "radial-gradient(120% 120% at 0% 0%, rgba(255,160,139,0.60) 0%, rgba(255,160,139,0.35) 40%, rgba(255,160,139,0.14) 70%, rgba(255,160,139,0.0) 100%)",
            filter: "blur(8px)",
          }}
        />
        {/* Decorative inner glow - bottom right */}
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-10 -right-10 w-[55%] h-[55%] rounded-[40px]"
          style={{
            background:
              "radial-gradient(120% 120% at 100% 100%, rgba(255,160,139,0.60) 0%, rgba(255,160,139,0.35) 40%, rgba(255,160,139,0.14) 70%, rgba(255,160,139,0.0) 100%)",
            filter: "blur(8px)",
          }}
        />
        <div className="p-4 sm:p-8 md:p-12 lg:p-16 h-full flex flex-col justify-center">
          {/* Top logos */}
          <div className="flex items-center justify-center gap-6 sm:gap-8 md:gap-12 mb-8 sm:mb-10">
            {/* Right logo - site logo */}
            <div className="h-16 sm:h-20 md:h-24 w-auto">
              <Image
                src="/assets/svg/logo.svg"
                alt="Licorice4Good"
                width={420}
                height={112}
                className="h-full w-auto object-contain"
              />
            </div>
          </div>

          {/* Countdown */}
          <div className="flex flex-wrap items-stretch justify-center gap-3 sm:gap-4 md:gap-6 lg:gap-8 max-w-[92vw] sm:max-w-4xl md:max-w-5xl mx-auto mb-8 sm:mb-10">
            <Card
              value={timeLeft.days.toString().padStart(2, "0")}
              label="DAYS"
            />
            <span className="hidden md:inline self-center text-3xl sm:text-4xl md:text-5xl font-extrabold text-black/70">
              :
            </span>
            <Card
              value={timeLeft.hours.toString().padStart(2, "0")}
              label="HOURS"
            />
            <span className="hidden md:inline self-center text-3xl sm:text-4xl md:text-5xl font-extrabold text-black/70">
              :
            </span>
            <Card
              value={timeLeft.minutes.toString().padStart(2, "0")}
              label="MINUTES"
            />
            <span className="hidden md:inline self-center text-3xl sm:text-4xl md:text-5xl font-extrabold text-black/70">
              :
            </span>
            <Card
              value={timeLeft.seconds.toString().padStart(2, "0")}
              label="SECONDS"
            />
          </div>

          {/* Launch date */}
          <div className="text-center text-black font-extrabold tracking-wide mb-6 text-2xl md:text-3xl">
            NOVEMBER 1, 2025
          </div>

          {/* Headline */}
          <div className="text-center mb-8">
            <h1 className="text-[28px] sm:text-[42px] px-3 md:text-[56px] lg:text-[64px] font-extrabold leading-tight">
              <span
                className="inline-block px-5 py-4 md:rounded-full rounded-2xl text-[#FF5D39]"
                style={{
                  background: "#FFFFFF1A",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.9), inset 0 0 0 2px rgba(255,255,255,0.35), inset 0 -12px 28px rgba(255,255,255,0.25)",
                  backdropFilter: "blur(2px)",
                }}
              >
                SOMETHING SWEET
                <span className="text-black">&nbsp;IS COMING...</span>
              </span>
            </h1>
          </div>

          {/* Sub text */}
          <div className="text-center text-gray-600 mb-10 text-lg md:text-xl">
            <div>Something Amazing Is Coming Very Soon.</div>
            <div>Stay Tuned!</div>
          </div>

          {/* Notify button */}
          <div className="flex items-center justify-center pb-2">
            <a
              href="mailto:info@Licorice4Good.com?subject=Notify%20me%20about%20fundraising"
              className="inline-flex items-center gap-3 bg-[#FF5D39] text-white font-bold px-8 py-4 rounded-xl shadow hover:opacity-90 transition-opacity text-lg"
            >
              Notify Me
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-black">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoonPage;
