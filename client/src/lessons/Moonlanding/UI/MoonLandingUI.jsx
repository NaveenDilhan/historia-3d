import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useKeyboardSkip } from '../hooks/useKeyboardSkip';

export default function MoonLandingUI({ hasStarted, phase, setPhase, launchProgress }) {
  const [showTitle, setShowTitle] = useState(false);
  const videoUrl = "/videos/jfk.mp4"; // Ensure this matches your public folder path

  // Keyboard skip hook (active only during the 'video' phase)
  useKeyboardSkip(phase === 'video', () => setPhase('title'));

  // Transition from Title card to Launch interaction
  useEffect(() => {
    if (phase === 'title') {
      setShowTitle(true);
      const timer = setTimeout(() => {
        setShowTitle(false);
        setTimeout(() => setPhase('launch'), 1500); // Wait for fade out
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [phase, setPhase]);

  if (!hasStarted) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col items-center justify-center">
      
      <AnimatePresence>
        {/* CHAPTER 1: JFK Video Intro */}
        {phase === 'video' && (
          <motion.div 
            key="video-layer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black flex items-center justify-center"
          >
            <video 
              autoPlay 
              className="w-full h-full object-cover opacity-60"
              onEnded={() => setPhase('title')}
            >
              <source src={videoUrl} type="video/mp4" />
            </video>
            
            {/* Overlay Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 bg-gradient-to-t from-black via-transparent to-transparent">
              <h2 className="text-white text-2xl font-serif tracking-widest mb-6 drop-shadow-md">
                "We choose to go to the Moon..."
              </h2>
              <p className="text-white/60 font-mono text-sm uppercase tracking-widest animate-pulse">
                Press [ENTER] to Skip
              </p>
            </div>
          </motion.div>
        )}

        {/* CHAPTER 1.5: Title Card */}
        {phase === 'title' && showTitle && (
          <motion.div 
            key="title-layer"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 1.5 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-serif text-white font-bold tracking-widest drop-shadow-2xl">
              CAPE KENNEDY
            </h1>
            <h3 className="text-xl md:text-3xl text-amber-200 mt-4 tracking-[0.3em] font-light drop-shadow-lg">
              JULY 16, 1969
            </h3>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CHAPTER 2: The Interactive Launch HUD */}
      {(phase === 'launch' || phase === 'liftoff') && (
        <div className="absolute bottom-16 w-full flex flex-col items-center justify-center">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: phase === 'launch' ? 1 : 0, y: 0 }}
            className="text-white text-xl md:text-2xl font-mono tracking-widest mb-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-bold uppercase"
          >
            Hold <span className="text-amber-400 bg-black/50 px-3 py-1 rounded border border-amber-500/50">[SPACEBAR]</span> to Ignite Engines
          </motion.div>

          <div className="w-80 h-4 bg-black/60 border-2 border-white/20 rounded-full overflow-hidden shadow-2xl backdrop-blur-sm relative">
            <motion.div 
              className="h-full bg-gradient-to-r from-amber-500 to-red-600"
              style={{ width: `${launchProgress}%` }}
              layout
            />
            {launchProgress > 80 && (
               <div className="absolute inset-0 bg-red-500/30 animate-pulse mix-blend-screen" />
            )}
          </div>
          
          <div className="mt-2 text-white/50 font-mono text-sm">
            THRUST: {Math.floor(launchProgress)}%
          </div>
          
        </div>
      )}

    </div>
  );
}