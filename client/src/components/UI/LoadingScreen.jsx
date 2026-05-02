import React, { useState, useEffect } from 'react';
import { useProgress } from '@react-three/drei';
import { motion } from 'framer-motion';

export default function LoadingScreen({ hasLoaded, onStart, isRevealing }) {
  const { progress, errors } = useProgress();
  const [smoothProgress, setSmoothProgress] = useState(0);

  // Guarantee the progress bar only moves forward (0 to 100 once)
  useEffect(() => {
    setSmoothProgress((prev) => {
      const next = Math.max(prev, progress || 0);
      return hasLoaded && next < 100 ? 100 : next;
    });
  }, [progress, hasLoaded]);

  // Dynamic text logic
  let statusText = 'Consulting the Archives...';
  if (hasLoaded) {
    statusText = 'Environment Ready.';
  } else if (smoothProgress >= 100) {
    statusText = 'Compiling Shaders...';
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black z-0 pointer-events-none"></div>
      
      {/* Inner Container: Fades out smoothly the moment the user clicks Start */}
      <div className={`relative z-10 flex flex-col items-center w-full max-w-md px-8 transition-opacity duration-500 ease-in-out ${isRevealing ? 'opacity-0' : 'opacity-100'}`}>
        
        {/* Animated Visual Banner */}
        <motion.img
          src="/assets/dark_brown.png"
          alt="Historia Loading Banner"
          className="w-64 md:w-80 mb-6 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
          style={{ filter: "brightness(0) invert(1) sepia(1) saturate(5) hue-rotate(5deg) drop-shadow(0 0 10px rgba(251, 191, 36, 0.6))" }}
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <p style={{ fontFamily: "'Lato', sans-serif" }} className="text-amber-200/60 text-sm tracking-wider animate-pulse text-center mb-10 h-4">
          {statusText}
        </p>

        {hasLoaded ? (
          // Beautiful Start Button
          <button 
            onClick={onStart}
            className="group relative px-10 py-4 bg-gradient-to-r from-amber-700 to-amber-900 text-amber-50 rounded-lg font-bold tracking-widest uppercase overflow-hidden shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_40px_rgba(245,158,11,0.7)] transition-all duration-300 hover:scale-105 active:scale-95 border border-amber-500/50"
          >
            <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full -translate-x-full transition-transform duration-700 ease-out skew-x-12"></div>
            <span className="relative z-10">Begin Journey</span>
          </button>
        ) : (
          <div className="w-full flex flex-col items-center">
            {/* Spinning relic */}
            <div className="w-12 h-12 border-4 border-amber-900 border-t-amber-500 rounded-full animate-spin mb-8 shadow-[0_0_15px_rgba(245,158,11,0.3)]"></div>
            
            {/* Progress Bar Track */}
            <div className="w-full bg-black/80 border border-amber-900/50 rounded-full h-3 mb-4 overflow-hidden shadow-inner">
              {/* Progress Bar Fill */}
              <div 
                className="bg-gradient-to-r from-amber-900 via-amber-600 to-amber-400 h-full rounded-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(245,158,11,0.6)]"
                style={{ width: `${Math.max(0, Math.min(100, smoothProgress))}%` }}
              ></div>
            </div>
            
            {/* Percentage */}
            <div className="flex justify-center w-full text-xs text-amber-500/90 font-mono font-bold tracking-widest">
              <span>{Math.round(smoothProgress)}%</span>
            </div>
          </div>
        )}

        {/* Network Error Failsafe */}
        {errors.length > 0 && !hasLoaded && (
          <p className="text-red-500 text-xs mt-6 text-center font-mono bg-red-900/20 border border-red-900/50 px-3 py-2 rounded-lg">
            Network fluctuations detected. Recovering...
          </p>
        )}
      </div>
    </div>
  );
}