import React from 'react';
import { useProgress } from '@react-three/drei';

export default function LoadingScreen() {
  const { progress, errors, item, loaded, total } = useProgress();

  // Make the status text dynamically reflect the exact state
  let statusText = 'Constructing the simulation...';
  if (progress === 100) {
    statusText = 'Initializing environment...';
  } else if (item) {
    // Show the filename currently being decoded
    statusText = `Decoding: ${item.split('/').pop()}`;
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-screen bg-[#1a120b] relative overflow-hidden">
      {/* Background elements matched to ExplorePage */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black z-0"></div>
      
      <div className="relative z-10 flex flex-col items-center w-full max-w-md px-8">
        {/* Spinning loading indicator */}
        <div className="w-16 h-16 border-4 border-amber-900 border-t-amber-500 rounded-full animate-spin mb-6 shadow-[0_0_15px_rgba(245,158,11,0.3)]"></div>
        
        <h2 style={{ fontFamily: "'Cinzel', serif" }} className="text-2xl font-bold text-amber-100 mb-2 tracking-widest drop-shadow-lg text-center">
          CONSULTING THE ARCHIVES
        </h2>
        
        {/* Dynamic Status Text */}
        <p style={{ fontFamily: "'Lato', sans-serif" }} className="text-amber-200/60 text-sm tracking-wider animate-pulse text-center mb-6 h-4">
          {statusText}
        </p>

        {/* Progress Bar Track */}
        <div className="w-full bg-black/60 border border-amber-900/50 rounded-full h-3 mb-2 overflow-hidden shadow-inner">
          {/* Progress Bar Fill */}
          <div 
            className="bg-gradient-to-r from-amber-800 via-amber-600 to-amber-400 h-full rounded-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(245,158,11,0.6)]"
            style={{ width: `${progress || 0}%` }}
          ></div>
        </div>

        {/* Statistics (Percentage and Assets Loaded vs Total) */}
        <div className="flex justify-between w-full text-xs text-amber-500/80 font-mono px-1">
          <span>{Math.round(progress || 0)}%</span>
          <span>{loaded || 0} / {total || 0} Assets</span>
        </div>

        {/* Show error notification if any file fails to load */}
        {errors.length > 0 && (
          <p className="text-red-500 text-xs mt-4 text-center font-mono bg-red-900/20 px-3 py-1 rounded">
            Failed to fetch certain archives. Bypassing...
          </p>
        )}
      </div>
    </div>
  );
}