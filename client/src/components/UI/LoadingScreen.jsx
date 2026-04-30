import React from 'react';
import { useProgress } from '@react-three/drei';

export default function LoadingScreen({ hasLoaded, onStart, isRevealing }) {
  const { progress, errors } = useProgress();

  // Dynamic text logic
  let statusText = 'Consulting the Archives...';
  if (hasLoaded) {
    statusText = 'Environment Ready.';
  } else if (progress === 100) {
    statusText = 'Compiling Shaders...';
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full relative overflow-hidden">
      
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black z-0 pointer-events-none"></div>
      
      {/* Inner Container: Fades out smoothly the moment the user clicks Start */}
      <div className={`relative z-10 flex flex-col items-center w-full max-w-md px-8 transition-opacity duration-500 ease-in-out ${isRevealing ? 'opacity-0' : 'opacity-100'}`}>
        
        <h2 style={{ fontFamily: "'Cinzel', serif" }} className="text-3xl md:text-4xl font-bold text-amber-100 mb-2 tracking-widest drop-shadow-lg text-center">
          HISTORIA 3D
        </h2>
        
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
                style={{ width: `${Math.max(0, Math.min(100, progress || 0))}%` }}
              ></div>
            </div>
            
            {/* Percentage */}
            <div className="flex justify-center w-full text-xs text-amber-500/90 font-mono font-bold tracking-widest">
              <span>{Math.round(progress || 0)}%</span>
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