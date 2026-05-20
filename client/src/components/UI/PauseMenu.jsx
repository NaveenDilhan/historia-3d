import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Volume2, VolumeX, MessageSquare, LogOut, Maximize, Minimize, Type } from 'lucide-react';

function MenuButton({ icon, label, onClick, highlight, isDanger }) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold text-sm tracking-widest uppercase transition-all duration-300
        ${highlight 
           ? 'bg-gradient-to-r from-amber-700 to-amber-900 text-amber-50 shadow-lg hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] border border-amber-500/30' 
           : isDanger 
             ? 'bg-red-950/20 text-red-400 hover:bg-red-900/40 border border-red-900/30'
             : 'bg-black/40 text-amber-200/80 hover:bg-amber-900/40 hover:text-amber-100 border border-amber-900/40'}
        hover:scale-[1.02] active:scale-95
      `}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

export default function PauseMenu({ 
  isPaused, 
  handleResume, 
  soundMuted, 
  toggleSound, 
  subsMuted, 
  toggleSubs, 
  subSize,
  cycleSubSize,
  handleQuit 
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error(`Error attempting to toggle fullscreen: ${err.message}`);
    }
  };

  return (
    <AnimatePresence>
      {isPaused && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-lg p-4"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-[#1a130e]/90 border border-amber-900/50 p-10 rounded-3xl max-w-sm w-full flex flex-col items-center shadow-[0_0_60px_rgba(245,158,11,0.15)] relative overflow-hidden"
          >
            {/* Decorative Header */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-amber-600 to-transparent opacity-80"></div>
            
            <h2 style={{ fontFamily: "'Cinzel', serif" }} className="text-3xl font-bold text-amber-100 mb-2 tracking-[0.2em] drop-shadow-md">
              PAUSED
            </h2>
            <div className="w-16 h-px bg-amber-700/50 mb-8"></div>

            {/* Menu Buttons */}
            <div className="flex flex-col gap-4 w-full">
              <MenuButton 
                icon={<Play size={18} />} 
                label="Resume Simulation" 
                onClick={handleResume} 
                highlight 
              />
              <MenuButton 
                icon={isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />} 
                label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"} 
                onClick={toggleFullscreen} 
              />
              <MenuButton 
                icon={soundMuted ? <VolumeX size={18} /> : <Volume2 size={18} />} 
                label={`Sound: ${soundMuted ? 'OFF' : 'ON'}`} 
                onClick={toggleSound} 
              />
              <MenuButton 
                icon={<MessageSquare size={18} />} 
                label={`Subtitles: ${subsMuted ? 'OFF' : 'ON'}`} 
                onClick={toggleSubs} 
              />
              {/* CHANGED DEFAULT FALLBACK TO SMALL */}
              {!subsMuted && (
                <MenuButton 
                  icon={<Type size={18} />} 
                  label={`Sub Size: ${subSize || 'SMALL'}`} 
                  onClick={cycleSubSize} 
                />
              )}
              
              <div className="h-px w-full bg-amber-900/30 my-2"></div>
              
              <MenuButton 
                icon={<LogOut size={18} />} 
                label="Abandon Quest" 
                onClick={handleQuit} 
                isDanger 
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}