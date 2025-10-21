import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface LoadingScreenProps {
  onComplete: () => void;
}

const LoadingScreen = ({ onComplete }: LoadingScreenProps) => {
  const [progress, setProgress] = useState(1);
  const [isScaling, setIsScaling] = useState(false);
  const [isRotating, setIsRotating] = useState(false);

  useEffect(() => {
    // Progress from 1% to 100% over 3 seconds
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsRotating(true);
          // Start rotation animation
          setTimeout(() => {
            setIsScaling(true);
            // Scale animation for 1 second, then show home page
            setTimeout(() => {
              onComplete();
            }, 1000);
          }, 500);
          return 100;
        }
        return prev + 1;
      });
    }, 30); // 30ms intervals for smooth progress

    return () => clearInterval(progressInterval);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 bg-primary flex flex-col items-center justify-center z-50 transition-all duration-1000 ease-in-out ${
      isScaling ? 'scale-150 opacity-0 rotate-12' : 'scale-100 opacity-100'
    }`}>
      <div className={`transition-all duration-700 ${
        isRotating ? 'animate-bounce rotate-12 scale-110' : 'animate-pulse'
      }`}>
        <Image
          src="/assets/svg/logo.svg"
          alt="Southern Sweet & Sour Logo"
          width={400}
          height={120}
          className="w-auto h-24 md:h-32 lg:h-40"
          priority
        />
      </div>
      
      {/* Progress Text with cool animation */}
      <div className={`mt-8 text-white text-2xl md:text-3xl font-bold transition-all duration-500 ${
        isRotating ? 'animate-ping scale-125' : 'animate-pulse'
      }`}>
        {progress}%
      </div>

      {/* Cool loading dots */}
      <div className={`mt-6 flex space-x-2 transition-all duration-500 ${
        isRotating ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
      }`}>
        <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
        <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  );
};

export default LoadingScreen; 