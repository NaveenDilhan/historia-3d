import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import JFKVideo from './JFKVideo';

export default function MoonLandingUI({ hasStarted, phase, setPhase, launchProgress }) {
  const [showTitle, setShowTitle] = useState(false);

  // Transition from Title card to Launch interaction
  useEffect(() => {
    if (phase === 'title') {
      setShowTitle(true);
      const timer = setTimeout(() => {
        setShowTitle(false);
        setTimeout(() => setPhase('launch'), 2000); // Wait for the text to fully fade out
      }, 4500); // Keep title on screen slightly longer
      return () => clearTimeout(timer);
    }
  }, [phase, setPhase]);

  if (!hasStarted) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col items-center justify-center">
      
      {/* mode="wait" ensures the video completely fades away before the title appears */}
      <AnimatePresence mode="wait">
        
        {/* CHAPTER 1: JFK Video Intro */}
        {phase === 'video' && (
          <JFKVideo onComplete={() => setPhase('title')} />
        )}

        {/* CHAPTER 1.5: Title Card with Cinematic Blur */}
        {phase === 'title' && showTitle && (
          <motion.div 
            key="title-layer"
            initial={{ opacity: 0, scale: 0.90, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
            transition={{ duration: 2, ease: 'easeInOut' }}
            className="text-center absolute inset-0 flex flex-col items-center justify-center bg-black z-40"
          >
            <h1 className="text-5xl md:text-8xl font-serif text-white font-bold tracking-widest drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
              CAPE KENNEDY
            </h1>
            <h3 className="text-xl md:text-3xl text-amber-200 mt-6 tracking-[0.5em] font-light drop-shadow-lg">
              JULY 16, 1969
            </h3>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CHAPTER 2: The Interactive Launch HUD */}
      <AnimatePresence>
        {(phase === 'launch' || phase === 'liftoff') && (
          <motion.div 
            key="launch-hud"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: phase === 'launch' ? 1 : 0, y: 0 }}
            transition={{ duration: 1.5, delay: 0.5 }}
            className="absolute bottom-16 w-full flex flex-col items-center justify-center z-30"
          >
            <motion.div 
              className="text-white text-xl md:text-2xl font-mono tracking-widest mb-6 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-bold uppercase"
            >
              Hold <span className="text-amber-400 bg-black/60 px-3 py-1 rounded border border-amber-500/50 shadow-[0_0_15px_rgba(251,191,36,0.3)]">[SPACEBAR]</span> to Ignite Engines
            </motion.div>

            {/* Upgraded Progress Bar */}
            <div className="w-[400px] max-w-[90vw] h-6 bg-black/80 border border-white/30 rounded-full overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-md relative">
              <motion.div 
                className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 shadow-[0_0_20px_rgba(255,0,0,0.8)]"
                style={{ width: `${launchProgress}%` }}
                layout
              />
              
              {/* Intense shaking/flashing as it nears 100% */}
              {launchProgress > 80 && (
                 <div className="absolute inset-0 bg-red-500/40 animate-[pulse_0.2s_ease-in-out_infinite] mix-blend-screen" />
              )}
            </div>
            
            <div className="mt-4 text-white/70 font-mono text-sm tracking-widest bg-black/50 px-4 py-1 rounded-full border border-white/10">
              THRUST: <span className="text-amber-400 font-bold">{Math.floor(launchProgress)}%</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}