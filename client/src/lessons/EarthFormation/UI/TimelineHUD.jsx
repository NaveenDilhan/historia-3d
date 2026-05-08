import React from 'react';

export default function TimelineHUD({ activeEra, progress }) {
  return (
    <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-50">
      <div className="bg-black/60 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-xl text-center">
        <h2 className="text-3xl font-bold uppercase tracking-widest text-emerald-400">
          {activeEra?.name || 'Initializing...'}
        </h2>
        <p className="text-lg font-light text-gray-300 mt-1">
          {activeEra?.time}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-96 h-2 bg-gray-800 rounded-full mt-4 overflow-hidden border border-white/10">
        <div 
          className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-300 ease-out"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <p className="text-white/50 text-xs mt-2 font-mono uppercase">Scroll to advance time</p>
    </div>
  );
}