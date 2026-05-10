import React from 'react';
import { motion } from 'framer-motion';
import { useKeyboardSkip } from '../hooks/useKeyboardSkip';

export default function JFKVideo({ onComplete }) {
  const videoUrl = "/videos/jfk.mp4"; // Ensure this matches your public folder path

  // Use the keyboard hook to skip the video using Enter, Space, or Escape
  useKeyboardSkip(true, onComplete);

  return (
    <motion.div 
      key="video-layer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1.5, ease: 'easeInOut' } }} // Smoother slow fade out
      className="absolute inset-0 bg-black flex items-center justify-center overflow-hidden z-50 pointer-events-auto"
    >
      {/* Vintage 1960s TV CRT Container */}
      <div className="relative w-full h-full max-w-6xl max-h-[80vh] aspect-video mx-auto overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.05)] border border-white/5 md:rounded-3xl bg-black">
        
        {/* CRT Scanline & Vignette Effects Overlay */}
        <div className="absolute inset-0 z-10 pointer-events-none mix-blend-overlay opacity-60 bg-[radial-gradient(circle,transparent_50%,rgba(0,0,0,0.9)_100%)]" />
        <div className="absolute inset-0 z-10 pointer-events-none opacity-20 bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
        
        <video 
          autoPlay 
          className="w-full h-full object-cover contrast-125 brightness-90 sepia-[.4] grayscale-[.6]"
          onEnded={onComplete}
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      </div>
      
      {/* Cinematic Overlay Text */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center z-20 bg-gradient-to-t from-black via-black/80 to-transparent pt-32 pb-12">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 2, ease: "easeOut" }}
          className="text-white/90 text-2xl md:text-4xl font-serif tracking-widest mb-8 drop-shadow-[0_4px_4px_rgba(0,0,0,1)] text-center px-4"
        >
          "We choose to go to the Moon..."
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3, duration: 1 }}
          className="text-white/40 font-mono text-sm uppercase tracking-[0.4em] animate-pulse"
        >
          Press [ENTER] or [SPACE] to Skip
        </motion.p>
      </div>
    </motion.div>
  );
}