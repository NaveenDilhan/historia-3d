import React from 'react';

export default function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-screen bg-[#1a120b] relative overflow-hidden">
      {/* Background elements matched to ExplorePage */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black z-0"></div>
      
      <div className="relative z-10 flex flex-col items-center">
        {/* Spinning loading indicator */}
        <div className="w-16 h-16 border-4 border-amber-900 border-t-amber-500 rounded-full animate-spin mb-6 shadow-[0_0_15px_rgba(245,158,11,0.3)]"></div>
        
        <h2 style={{ fontFamily: "'Cinzel', serif" }} className="text-2xl font-bold text-amber-100 mb-2 tracking-widest drop-shadow-lg">
          CONSULTING THE ARCHIVES
        </h2>
        <p style={{ fontFamily: "'Lato', sans-serif" }} className="text-amber-200/60 text-sm tracking-wider animate-pulse">
          Constructing the simulation...
        </p>
      </div>
    </div>
  );
}